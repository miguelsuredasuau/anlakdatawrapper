const { customAlphabet } = require('nanoid');
const { camelize } = require('humps');
const Boom = require('@hapi/boom');
const path = require('path');
const jsesc = require('jsesc');
const crypto = require('crypto');
const fs = require('fs-extra');
const get = require('lodash/get');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const assignDeep = require('assign-deep');
const cloneDeep = require('lodash/cloneDeep');
const defaultChartMetadata = require('@datawrapper/service-utils/defaultChartMetadata');
const utils = {};

utils.camelizeTopLevelKeys = obj => {
    // Taken from humps library, see here:
    // https://github.com/domchristie/humps/blob/d612998749922a76c68d4d9c8b5ae93f02595019/humps.js#L29-L34
    const outputObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            outputObj[camelize(key)] = obj[key];
        }
    }
    return outputObj;
};

/**
 * Prepares a chart before it gets returned as API response.
 *
 * This will extend the metadata from the defaultChartMetadata
 * to make sure our editor functions properly.
 *
 * @param {object} chart
 * @param {object} additionalData
 * @returns {object}
 */
utils.prepareChart = async (chart, additionalData = {}) => {
    const { user, in_folder, ...dataValues } = chart.dataValues;

    const publicId =
        typeof chart.getPublicId === 'function' ? await chart.getPublicId() : undefined;

    return {
        ...utils.camelizeTopLevelKeys(additionalData),
        publicId,
        language: 'en_US',
        theme: 'datawrapper',
        ...utils.camelizeTopLevelKeys(dataValues),
        folderId: in_folder,
        metadata: assignDeep(cloneDeep(defaultChartMetadata), dataValues.metadata),
        author: user ? { name: user.name, email: user.email } : undefined,
        guestSession: undefined
    };
};

utils.stringify = obj => {
    return jsesc(JSON.stringify(obj), {
        isScriptContext: true,
        json: true,
        wrap: true
    });
};

function createHashedFileName(filePath, hash) {
    const ext = path.extname(filePath);
    const name = [path.basename(filePath, ext), hash].join('.');
    return path.format({ name, ext });
}

utils.writeFileHashed = async function (name, value, destination, { prefix, hashLength = 8 } = {}) {
    let hash = crypto.createHash('sha256');
    hash.update(value);
    hash = hash.digest('hex').slice(0, hashLength);
    let hashedFileName = createHashedFileName(name, hash);
    if (prefix) {
        hashedFileName = `${prefix}.${hashedFileName}`;
    }
    await fs.writeFile(path.join(destination, hashedFileName), value);
    return hashedFileName;
};

utils.copyFileHashed = (filePath, destination, { prefix, hashLength = 8 } = {}) => {
    let hash = crypto.createHash('sha256');
    const outFileName = path.basename(filePath);

    const outFilePath = path.join(destination, `temp-${utils.generateToken(5)}-${outFileName}`);
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(outFilePath);

    input.pipe(output);
    input.on('data', chunk => {
        hash.update(chunk);
    });

    return new Promise((resolve, reject) => {
        input.on('error', reject);
        output.on('error', reject);

        output.on('finish', rename);
        async function rename() {
            hash = hash.digest('hex').slice(0, hashLength);
            let hashedFileName = createHashedFileName(filePath, hash);
            if (prefix) {
                hashedFileName = `${prefix}.${hashedFileName}`;
            }
            await fs.move(outFilePath, path.join(destination, hashedFileName));
            resolve(hashedFileName);
        }
    });
};

utils.readFileAndHash = async (filePath, hashLength = 8) => {
    const content = await fs.readFile(filePath, { encoding: 'utf-8' });
    let hash = crypto.createHash('sha256');

    hash.update(content);
    hash = hash.digest('hex').slice(0, hashLength);

    return {
        fileName: createHashedFileName(filePath, hash),
        content
    };
};

utils.cookieTTL = days => {
    return 1000 * 3600 * 24 * days; // 1000ms = 1s -> 3600s = 1h -> 24h = 1d
};

utils.generateToken = (length = 25) => {
    return customAlphabet(alphabet, length)();
};

utils.noop = () => {};

utils.loadChart = async function (id) {
    const { Op } = require('@datawrapper/orm').db;
    const { Chart } = require('@datawrapper/orm/models');

    const chart = await Chart.findOne({
        where: {
            id,
            deleted: { [Op.not]: true }
        }
    });

    if (!chart) {
        throw Boom.notFound();
    }

    return chart;
};

utils.copyChartAssets = function (server) {
    const { event, events } = server.app;
    return async function (srcChart, chart, copyPublic = false) {
        const assets = ['.csv', '.map.json', '.minimap.json', '.highlight.json'];
        for (const filename of assets) {
            try {
                let stream;
                try {
                    stream = await events.emit(
                        event.GET_CHART_ASSET,
                        {
                            chart: srcChart,
                            filename:
                                srcChart.id +
                                (filename === '.csv' && copyPublic ? '.public.csv' : filename)
                        },
                        { filter: 'first' }
                    );
                } catch (error) {
                    if (error.name === 'CodedError' && error.code === 'notFound') {
                        // Do nothing when the chart asset was not found.
                        continue;
                    }
                    throw error;
                }

                let data = '';

                for await (const chunk of stream) {
                    data += chunk;
                }

                await events.emit(event.PUT_CHART_ASSET, {
                    chart,
                    filename: chart.id + filename,
                    data
                });
            } catch (ex) {
                console.error(ex);
                continue;
            }
        }
    };
};

utils.getAdditionalMetadata = async (chart, { server }) => {
    const data = {};
    let additionalMetadata = await server.app.events.emit(
        server.app.event.ADDITIONAL_CHART_DATA,
        {
            chartId: chart.id,
            forkedFromId: chart.forked_from
        },
        { filter: 'success' }
    );

    additionalMetadata = Object.assign({}, ...additionalMetadata);

    if (chart.forked_from && chart.is_fork) {
        const { Chart } = require('@datawrapper/orm/models');

        const forkedFromChart = await Chart.findByPk(chart.forked_from, {
            attributes: ['metadata']
        });
        const basedOnBylineText = get(forkedFromChart, 'metadata.describe.byline', null);

        if (basedOnBylineText) {
            let basedOnUrl = get(additionalMetadata, 'river.source_url', null);

            if (!basedOnUrl) {
                let results = await server.app.events.emit(
                    server.app.event.GET_CHART_DISPLAY_URL,
                    {
                        chart
                    },
                    { filter: 'success' }
                );

                results = Object.assign({}, ...results);
                basedOnUrl = results.url;
            }

            data.basedOnByline = basedOnUrl
                ? `<a href='${basedOnUrl}' target='_blank' rel='noopener'>${basedOnBylineText}</a>`
                : basedOnBylineText;
        }
    }

    return data;
};

/**
 * Check that the passed string can be used as a JSON object key in a MySQL JSON column.
 *
 * Do that by checking that the length of the string is shorter than 2**16, which is a number
 * discovered by trial and error.
 */
function isValidMySQLJSONObjectKey(s) {
    return !s || s.length < 2 ** 16;
}

const INVALID_UTF16_REGEXP = new RegExp(
    '([\ud800-\udbff](?![\udc00-\udfff]))|((?<![\ud800-\udbff])[\udc00-\udfff])'
);

/**
 * Check that the passed string is a valid UTF-16 string.
 *
 * Do that by checking that each UTF-16 lead surrogate is followed by a tail surrogate.
 *
 * @see https://mnaoumov.wordpress.com/2014/06/14/stripping-invalid-characters-from-utf-16-strings/
 */
function isValidUTF16(s) {
    return !INVALID_UTF16_REGEXP.test(s);
}

/**
 * Check that the passed value can be used as the value of a MySQL JSON column.
 *
 * @see isValidUTF16()
 * @see isValidMySQLJSONKey()
 */
function isValidMySQLJSON(x) {
    if (!x) {
        return true;
    }
    if (typeof x === 'number') {
        return true;
    }
    if (typeof x === 'string') {
        return isValidUTF16(x);
    }
    if (Array.isArray(x)) {
        return x.every(isValidMySQLJSON);
    }
    if (typeof x === 'object' && x.constructor === Object) {
        for (const [k, v] of Object.entries(x)) {
            if (!isValidMySQLJSONObjectKey(k) || !utils.isValidMySQLJSON(v)) {
                return false;
            }
        }
    }
    return true;
}

utils.isValidMySQLJSON = isValidMySQLJSON;

/**
 * the attributes used in GET /v3/charts and
 * GET /v3/users/:id/recently-edited-charts etc
 */
utils.GET_CHARTS_ATTRIBUTES = [
    'id',
    'title',
    'type',
    'createdAt',
    'in_folder',
    'author_id',
    'organization_id',
    'last_edit_step',
    'last_modified_at',
    'public_version',
    'published_at',
    'theme',
    'language'
];

module.exports = utils;
