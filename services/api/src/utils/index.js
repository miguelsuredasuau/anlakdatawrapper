const { customAlphabet } = require('nanoid');
const Boom = require('@hapi/boom');
const path = require('path');
const jsesc = require('jsesc');
const crypto = require('crypto');
const fs = require('fs-extra');
const get = require('lodash/get');
const partition = require('lodash/partition');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const prepareChart = require('@datawrapper/service-utils/prepareChart');
const utils = {};

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
utils.prepareChart = prepareChart;

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
 * Takes array of Chart model items with User model included,
 * and sets updated properties defined in chartUpdate, including new organization_id,
 * as well as setting new author_id for charts where original author doesn't have access to new team
 */
utils.updateChartsAndMoveToNewTeam = async function ({
    charts,
    user: requestingUser,
    chartUpdate,
    transaction
}) {
    const { Chart } = require('@datawrapper/orm/models');

    const [mayAccess, mayNotAccess] = await utils.checkChartAuthorsMayAccessTeam(
        charts,
        chartUpdate.organization_id
    );
    if (mayNotAccess.length) {
        const newAuthorId = await utils.getNewChartAuthor(
            requestingUser,
            chartUpdate.organization_id
        );
        await Chart.update(
            { ...chartUpdate, author_id: newAuthorId },
            {
                where: {
                    id: mayNotAccess
                },
                ...(transaction ? { transaction } : false)
            }
        );
    }
    if (mayAccess.length) {
        await Chart.update(chartUpdate, {
            where: {
                id: mayAccess
            },
            ...(transaction ? { transaction } : false)
        });
    }
};

/**
 * Checks array of chart model items (with user model included) and returns ids
 * of charts for which respective authors may, and may not access the passed team
 */
utils.checkChartAuthorsMayAccessTeam = async function (charts, teamId) {
    const res = await Promise.all(
        charts.map(({ user: author, id }) =>
            author.getTeams().then(teams => ({
                id,
                mayAccess: teams.map(t => t.id).includes(teamId)
            }))
        )
    );
    return partition(res, ['mayAccess', true]).map(group => group.map(({ id }) => id));
};
/**
 * Returns author_id to set on chart when user updates chart organization_id
 * and the original author does not have access to the new team
 */
utils.getNewChartAuthor = async function (requestingUser, targetTeamId) {
    // for non-admins, directly assign chart to requesting user
    if (!requestingUser.isAdmin()) return requestingUser.id;

    // for admins, assign chart to target team's owner
    const { UserTeam } = require('@datawrapper/orm/models');
    const owner = await UserTeam.findOne({
        where: {
            organization_id: targetTeamId,
            team_role: 'owner'
        }
    });
    // target team has no owner, so there is no appropriate user to re-assign chart to
    if (!owner) throw Boom.badRequest();
    return owner.user_id;
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
function isValidMySQLJSON(x, nestedLevel = 0) {
    if (nestedLevel >= 100) {
        // MySQL only allows JSON objects to be at most 100 levels deep:
        // https://stackoverflow.com/questions/58697562/why-does-mysql-hardcode-the-max-depth-of-a-json-document
        return false;
    }
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
        return x.every(el => isValidMySQLJSON(el, nestedLevel + 1));
    }
    if (typeof x === 'object' && x.constructor === Object) {
        for (const [k, v] of Object.entries(x)) {
            if (!isValidMySQLJSONObjectKey(k) || !isValidMySQLJSON(v, nestedLevel + 1)) {
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
