const Joi = require('joi');
const Boom = require('@hapi/boom');
const assign = require('assign-deep');
const { Theme } = require('@datawrapper/orm/db');
const { compileCSS } = require('@datawrapper/chart-core/lib/styles/compile-css.js');
const deepmerge = require('deepmerge');
const get = require('lodash/get');

function getThemeCacheKey(id, { dark = false, extend = false } = {}) {
    return `${id}?dark=${dark}&extend=${extend}`;
}

module.exports.getThemeCacheKey = getThemeCacheKey;

module.exports.dropCache = async function ({ theme, themeCache, styleCache, visualizations }) {
    const descendants = await findDescendants(theme);

    for (const t of descendants) {
        if (styleCache) {
            for (const visId of visualizations.keys()) {
                const vis = visualizations.get(visId);
                await styleCache.drop(`${t.id}__${visId}__${vis.__styleHash}`);
                await styleCache.drop(`${t.id}__${visId}__dark__${vis.__styleHash}`);
                await styleCache.drop(`${t.id}__${visId}`);
            }
        }

        if (themeCache) {
            await themeCache.drop(getThemeCacheKey(t.id));
            await themeCache.drop(getThemeCacheKey(t.id, { dark: true }));
            await themeCache.drop(getThemeCacheKey(t.id, { extend: true }));
            await themeCache.drop(getThemeCacheKey(t.id, { dark: true, extend: true }));
        }
    }
};

module.exports.getCaches = function (server) {
    return {
        styleCache: server.cache({ segment: 'vis-styles', shared: true }),
        themeCache: server.cache({
            segment: 'themes',
            shared: true,
            expiresIn: 30 * 864e5 /* 30 days */
        })
    };
};

async function findDescendants(theme) {
    let checkNext = [theme];
    const descendants = [theme];

    while (checkNext.length) {
        // find all themes that extend from current
        const children = await Theme.findAll({
            where: { extend: checkNext.map(el => el.id) }
        });

        children.forEach(child => {
            descendants.push(child);
        });

        checkNext = children;
    }
    return descendants;
}

module.exports.findDarkModeOverrideKeys = async function (server, theme = {}) {
    const themeSchema = await server.methods.getSchemas().getSchemaJSON('themeData');
    const keepUnits = new Set(['hexColor', 'cssColor', 'cssBorder', 'hexColorAndOpacity']);
    const out = [];
    const refs = [];

    walk(themeSchema, '');

    function walk(obj, path) {
        if (obj?.shared) refs.unshift(...obj.shared);
        if (obj?.type === 'link') {
            const id = obj.link.ref.path[0];
            const ref = refs.find(({ flags }) => flags.id === id);
            if (obj.whens) {
                const concattedSchemas = obj.whens.map(({ concat }) => concat).filter(Boolean);
                obj = ref;
                concattedSchemas.forEach(concattedSchema => {
                    obj = deepmerge(obj, concattedSchema);
                });
            } else {
                obj = ref;
            }
        }
        const isHexColorAndOpacity = obj?.flags?.unit === 'hexColorAndOpacity';

        if (obj?.type === 'object' && !isHexColorAndOpacity) {
            for (const key of Object.keys(obj.keys || {})) {
                walk(obj.keys[key], `${path}${path === '' ? '' : '.'}${key}`);
            }
            const allowedKeys = obj?.patterns?.[0]?.schema?.allow;
            if (allowedKeys) {
                allowedKeys.forEach(key => {
                    walk(obj.patterns[0].rule, `${path}${path === '' ? '' : '.'}${key}`);
                });
            }
        } else {
            const unit = obj?.flags?.unit;
            const metas = obj?.metas || [];

            const overrideInclude = metas.find(d => (d.overrideSupport || []).includes('darkMode'));
            const overrideExclude = metas.find(d => (d.overrideExclude || []).includes('darkMode'));

            if ((keepUnits.has(unit) || overrideInclude) && !overrideExclude) {
                const noInvert = !!metas.find(d => d.noDarkModeInvert);
                const props = { path, noInvert, isHexColorAndOpacity };
                if (path.includes('[i]')) {
                    getArrayKeys(props);
                } else {
                    out.push(props);
                }
            }

            if (obj?.type === 'array') {
                walk(obj?.items?.[0], `${path}[i]`);
            }
        }
    }

    function getArrayKeys(props) {
        const match = props.path.match(/\[i\]/);
        if (match) {
            for (const i in get(theme.data, props.path.slice(0, match.index), [])) {
                getArrayKeys({ ...props, path: props.path.replace(/(\[i\])/, `.${i}`) });
            }
        } else {
            out.push(props);
        }
    }

    return [...out];
};

module.exports.themeId = () =>
    Joi.string()
        .lowercase()
        .pattern(/^[a-z0-9]+(?:-{0,2}[a-z0-9]+)*$/)
        .min(2);

module.exports.validateThemeData = async function (data, server) {
    try {
        await server.methods.getSchemas().validateThemeData(data);
    } catch (err) {
        if (err.name === 'ValidationError') {
            throw Boom.badRequest(err.details.map(e => `- ${e.message}`).join('\n'));
        } else {
            throw err;
        }
    }
};

module.exports.validateThemeLess = async function (less, server, themeId, data) {
    try {
        let extendedThemeData = {};
        if (server && themeId) {
            const { result: theme } = await server.inject({
                url: `/v3/themes/${themeId}?extend=true`
            });
            extendedThemeData = theme.data;
            if (data) assign(extendedThemeData, data);
        }
        const themeToValidate = { less, data: extendedThemeData };
        await compileCSS({
            theme: themeToValidate,
            filePaths: []
        });
    } catch (err) {
        if (['Parse', 'Name'].includes(err.type)) {
            throw Boom.badRequest(`LESS error: "${err.message}"`);
        } else {
            throw err;
        }
    }
};
