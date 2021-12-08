const Joi = require('joi');
const Boom = require('@hapi/boom');
const assign = require('assign-deep');
const { compileFontCSS } = require('../../../publish/compile-css.js');
const { themeId } = require('../utils');
const { Theme, User, Team, Chart } = require('@datawrapper/orm/models');

module.exports = {
    name: 'routes/themes/{id}',
    version: '1.0.0',
    register: server => {
        const styleCache = server.cache({ segment: 'vis-styles', shared: true });
        const githeadCache = server.cache({ segment: 'vis-githead', shared: true });
        const themeCache = server.cache({ segment: 'themes', shared: true });

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
                        extend: Joi.boolean().default(false)
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
                if (data.data) await validateThemeData(data.data);
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
                        await styleCache.drop(`${t.id}__${visId}`);
                    }

                    await themeCache.drop(`${t.id}`);
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
                return h.response().code(204);
            }
        });

        require('./asset')(server);
        require('./font')(server);
        require('./users')(server);
        require('./teams')(server);

        async function validateThemeData(data) {
            try {
                await server.methods.validateThemeData(data);
            } catch (err) {
                if (err.name === 'ValidationError') {
                    throw Boom.badRequest(err.details.map(e => `- ${e.message}`).join('\n'));
                } else {
                    throw err;
                }
            }
        }
    }
};

async function getTheme(request) {
    const { server, params, query, url } = request;

    let originalExtend;
    let dataValues = { extend: params.id, data: {} };

    while (dataValues.extend) {
        const extendedTheme = await Theme.findByPk(dataValues.extend);

        if (!extendedTheme) return Boom.notFound();

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
    const fonts = getThemeFonts(theme);
    const fontsCSS = await compileFontCSS(fonts, theme.data);
    return { ...theme, fonts, createdAt: created_at, fontsCSS };
}

function getThemeFonts(theme) {
    const fonts = {};

    for (const [key, value] of Object.entries(theme.assets)) {
        if (theme.assets[key].type === 'font') fonts[key] = value;
    }
    return fonts;
}
