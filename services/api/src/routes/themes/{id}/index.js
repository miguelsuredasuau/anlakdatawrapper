const Joi = require('joi');
const Boom = require('@hapi/boom');
const assign = require('assign-deep');
const { compileFontCSS } = require('../../../publish/compile-css.js');
const { themeId, validateThemeData, validateThemeLess } = require('../utils');
const { Theme, User, Team, Chart } = require('@datawrapper/orm/models');
const { get, set } = require('lodash');
const chroma = require('chroma-js');
const invertColor = require('@datawrapper/shared/invertColor.cjs');
const { findDarkModeOverrideKeys } = require('./utils');

module.exports = {
    name: 'routes/themes/{id}',
    version: '1.0.0',
    register: server => {
        const config = server.methods.config();
        const useThemeCache = get(config, 'general.cache.themes');
        const styleCache = server.cache({ segment: 'vis-styles', shared: true });
        const githeadCache = server.cache({ segment: 'vis-githead', shared: true });
        const themeCache = server.cache({
            segment: 'themes',
            shared: true,
            expiresIn: 30 * 864e5 /* 30 days */
        });

        // GET /v3/themes/{id}
        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: {
                    mode: 'try',
                    access: { scope: ['theme:read'] }
                },
                validate: {
                    params: Joi.object({
                        id: themeId().required()
                    }),
                    query: Joi.object({
                        extend: Joi.boolean().default(false),
                        dark: Joi.boolean().default(false)
                    })
                }
            },
            handler: getTheme
        });

        // update theme PATCH /v3/themes/{id}
        server.route({
            path: '/',
            method: 'PATCH',
            options: {
                auth: 'admin',
                validate: {
                    params: Joi.object({
                        id: themeId().required()
                    }),
                    payload: Joi.object({
                        title: Joi.string(),
                        extend: themeId(),
                        data: Joi.object(),
                        assets: Joi.object(),
                        less: Joi.string()
                    })
                }
            },
            async handler(request) {
                const { params, payload } = request;
                const theme = await Theme.findByPk(params.id);
                if (!theme) return Boom.notFound();

                const data = {};

                // save colors.groups as flat array to colors.palette
                if (payload.data && payload.data.colors && payload.data.colors.groups) {
                    payload.data.colors.palette = payload.data.colors.groups.reduce(
                        (acc, group) => {
                            if (!group.colors) return acc;
                            group.colors.forEach(subgroup => {
                                acc.push(...subgroup);
                            });
                            return acc;
                        },
                        []
                    );
                }

                // copy white-listed attributes from payload
                ['title', 'extend', 'data', 'assets', 'less'].forEach(key => {
                    if (payload[key] !== undefined) data[key] = payload[key];
                });

                if (data.less) await validateThemeLess(data.less, server, theme.id);
                if (data.data) await validateThemeData(data.data, server);
                await theme.update(data);

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

                const descendants = await findDescendants(theme);

                for (const t of descendants) {
                    for (const visId of server.app.visualizations.keys()) {
                        const vis = server.app.visualizations.get(visId);
                        const githead = (await githeadCache.get(vis.id)) || vis.githead || 'head';

                        await styleCache.drop(`${t.id}__${visId}__${githead}`);
                        await styleCache.drop(`${t.id}__${visId}__dark__${githead}`);
                        await styleCache.drop(`${t.id}__${visId}`);
                    }

                    await themeCache.drop(`${t.id}?dark=false&extend=false`);
                    await themeCache.drop(`${t.id}?dark=false&extend=true`);
                    await themeCache.drop(`${t.id}?dark=true&extend=false`);
                    await themeCache.drop(`${t.id}?dark=true&extend=true`);
                }

                return theme.toJSON();
            }
        });

        // delete theme
        server.route({
            path: '/',
            method: 'DELETE',
            options: {
                auth: 'admin',
                validate: {
                    params: Joi.object({
                        id: themeId().required()
                    })
                }
            },
            async handler(request, h) {
                const { params } = request;
                const theme = await Theme.findByPk(params.id, {
                    include: [User, Team]
                });
                if (!theme) return Boom.notFound();

                // remove associations
                await theme.setUsers([]);
                await theme.setTeams([]);
                await Chart.update(
                    // todo: get default theme from config file
                    { theme: 'default' },
                    {
                        where: {
                            theme: theme.id
                        }
                    }
                );
                await theme.destroy();
                await themeCache.drop(`${theme.id}`);
                await themeCache.drop(`${theme.id}/dark`);
                return h.response().code(204);
            }
        });

        require('./asset')(server);
        require('./font')(server);
        require('./users')(server);
        require('./teams')(server);

        async function getTheme(request) {
            const { server, params, query, url } = request;
            const themeCacheKey = `${params.id}?dark=${query.dark}&extend=${query.extend}`;
            if (useThemeCache) {
                const cachedTheme = await themeCache.get(themeCacheKey);
                if (cachedTheme) return cachedTheme;
            }

            let originalExtend;
            let dataValues = { extend: params.id, data: {} };
            let overrides = [];

            while (dataValues.extend) {
                const extendedTheme = await Theme.findByPk(dataValues.extend);

                if (!extendedTheme) return Boom.notFound();

                if (get(extendedTheme.data, 'overrides')) {
                    overrides = [...get(extendedTheme.data, 'overrides'), ...overrides];
                }

                if (!originalExtend) {
                    originalExtend = extendedTheme.extend;
                }

                if (!dataValues.id) {
                    dataValues = {
                        ...extendedTheme.dataValues,
                        assets: extendedTheme.assets,
                        data: extendedTheme.data
                    };
                }

                if (extendedTheme.less !== dataValues.less) {
                    dataValues.less = `${extendedTheme.less || ''}
${dataValues.less || ''}
`;
                }

                dataValues.data = assign(extendedTheme.data, dataValues.data);
                dataValues.assets = { ...extendedTheme.assets, ...dataValues.assets };
                dataValues.extend = extendedTheme.extend;

                if (!query.extend) break;
            }

            dataValues.extend = originalExtend;
            dataValues.url = url.pathname;
            if (overrides.length) {
                dataValues.data.overrides = overrides;
            }

            if (server.methods.isAdmin(request)) {
                try {
                    await server.methods.validateThemeData(dataValues.data);
                    dataValues.errors = [];
                } catch (err) {
                    if (err.name === 'ValidationError') {
                        dataValues.errors = err.details;
                    } else {
                        throw err;
                    }
                }
            }

            const { created_at, ...theme } = dataValues;

            const { darkBg, origBg, origBgLum: bgColorLum } = getBackgroundColors(theme);
            const origGradients = get(theme, 'data.colors.gradients', []);

            if (bgColorLum >= 0.3) {
                if (query.dark) {
                    await convertToDarkMode({ theme, darkBg, origBg });
                }
            } else {
                // this theme is dark already, prevent dark mode preview
                set(
                    theme,
                    'data.options.darkMode.preview',
                    get(theme, 'data.options.darkMode.preview', false)
                );
            }
            set(theme, '_computed.bgLight', origBg);
            set(theme, '_computed.bgDark', darkBg);
            set(theme, '_computed.origGradients', origGradients);

            const fonts = getThemeFonts(theme);
            const fontsCSS = await compileFontCSS(fonts, theme.data);
            const result = { ...theme, fonts, createdAt: created_at, fontsCSS };
            if (useThemeCache) {
                themeCache.set(themeCacheKey, result);
            }
            return result;
        }
    }
};

async function convertToDarkMode({ theme, darkBg, origBg }) {
    // get dark mode settings
    const darkMode = mergeOverrides(theme, d => d.type === 'darkMode');

    const themeColorKeys = await findDarkModeOverrideKeys(theme);

    themeColorKeys.forEach(({ path: key, noInvert }) => {
        const darkThemeVal = get(darkMode, key);
        if (darkThemeVal) {
            set(theme.data, key, darkThemeVal);
        } else {
            const oldVal = get(theme.data, key);
            if (oldVal && !noInvert) {
                set(
                    theme.data,
                    key,
                    Array.isArray(oldVal)
                        ? oldVal.map(convertColor)
                        : typeof oldVal === 'string' && oldVal.includes(' ')
                        ? oldVal
                              .split(' ')
                              .map(part => (chroma.valid(part) ? convertColor(part) : part))
                              .join(' ')
                        : convertColor(oldVal)
                );
            } else if (key === 'colors.chartContentBaseColor') {
                set(theme.data, key, '#eeeeee');
            }
        }

        function convertColor(lightColor) {
            if (!chroma.valid(lightColor)) return lightColor;
            const lightContrast = chroma.contrast(origBg, lightColor);
            return invertColor(
                lightColor,
                darkBg,
                origBg,
                0.85 -
                    // boost text contrast if old text contrast was low already
                    (lightContrast < 8 && (key.includes('typography') || key.includes('text'))
                        ? 0.2
                        : 0)
            );
        }
    });

    set(theme, 'data.colors.background', darkBg);
    if (get(theme, 'data.style.body.background')) {
        set(theme, 'data.style.body.background', darkBg);
    }
}

function getBackgroundColors(theme) {
    const origBg = get(
        theme.data,
        'colors.background',
        get(theme.data, 'style.body.background', '#ffffff')
    );
    const origBgLum = chroma(origBg).luminance();
    const darkMode = mergeOverrides(theme, d => d.type === 'darkMode');
    const darkBg =
        origBgLum < 0.3
            ? origBg
            : get(
                  darkMode,
                  'colors.background',
                  chroma(origBg)
                      .luminance(origBgLum > 0.5 ? 1 - origBgLum : origBgLum * 0.5)
                      .hex()
              );
    return { darkBg, origBg, origBgLum };
}

function getThemeFonts(theme) {
    const fonts = {};

    for (const [key, value] of Object.entries(theme.assets)) {
        if (theme.assets[key].type === 'font') fonts[key] = value;
    }
    return fonts;
}

function mergeOverrides(theme, filterFunc) {
    const merged = {};
    get(theme.data, 'overrides', []).forEach(({ type, settings }) => {
        if (!filterFunc || filterFunc({ type, settings })) {
            Object.entries(settings).forEach(([key, value]) => {
                set(merged, key, value);
            });
        }
    });
    return merged;
}
