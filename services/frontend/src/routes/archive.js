const Joi = require('joi');
const { db } = require('@datawrapper/orm');
const { formatQueryString } = require('../utils/url.cjs');
const { getUserLanguage } = require('../utils/index');
const { groupCharts } = require('../utils/charts.cjs');
const keyBy = require('lodash/keyBy');
const mapValues = require('lodash/mapValues');

module.exports = {
    name: 'routes/archive',
    version: '1.0.0',
    register: async server => {
        const config = server.methods.config();
        const { createAPI } = require('./preview/utils');
        const apiBase = `${config.api.https ? 'https' : 'http'}://${config.api.subdomain}.${
            config.api.domain
        }/v3`;
        server.methods.prepareView('archive/Index.svelte');
        const Folder = server.methods.getModel('folder');
        const Chart = server.methods.getModel('chart');
        const Theme = server.methods.getModel('theme');

        const minLastEditStep = 2;

        const validQueryParams = Joi.object({
            groupBy: Joi.string().valid('author', 'status', 'type').default(null),
            limit: Joi.number().min(1).max(15).default(15),
            offset: Joi.number().default(0),
            search: Joi.string().allow('').default(''),
            order: Joi.string().valid('ASC', 'DESC').default('DESC'),
            orderBy: Joi.string()
                .valid(
                    'authorId',
                    'createdAt',
                    'lastEditStep',
                    'lastModifiedAt',
                    'publishedAt',
                    'title',
                    'type'
                )
                .default('lastModifiedAt')
        });

        server.route({
            method: 'GET',
            path: '/{folderId?}',
            options: {
                auth: 'user',
                validate: {
                    params: Joi.object({
                        folderId: Joi.number().integer().optional()
                    }),
                    query: validQueryParams
                },
                handler: visArchiveHandler
            }
        });

        server.route({
            method: 'GET',
            path: '/team/{teamId}/{folderId?}',
            options: {
                auth: 'user',
                validate: {
                    params: Joi.object({
                        teamId: Joi.string().required(),
                        folderId: Joi.number().integer().optional()
                    }),
                    query: validQueryParams
                },
                handler: visArchiveHandler
            }
        });

        async function visArchiveHandler(request, h) {
            const { auth, params, query } = request;
            const { teamId, folderId } = params;
            const { groupBy, limit, offset, order, orderBy, search } = query;
            const user = auth.artifacts;

            const language = getUserLanguage(auth);
            const __ = key => server.methods.translate(key, { scope: 'core', language });
            const visualizations = Object.fromEntries(
                Array.from(server.app.visualizations.keys()).map(key => [
                    key,
                    server.app.visualizations.get(key)
                ])
            );

            const api = createAPI(
                apiBase,
                config.api.sessionID,
                auth.credentials && auth.credentials.data ? auth.credentials.data.id : ''
            );

            if (folderId) {
                // check if folder exists
                const cnt = await Folder.count({
                    where: {
                        id: folderId,
                        ...(teamId ? { org_id: teamId } : {})
                    }
                });
                // redirect to root folder
                if (!cnt) return h.redirect(`/archive${teamId ? `/${teamId}` : ''}`);
            }

            const teams = (await user.getTeams())
                .filter(d => !d.user_team.getDataValue('invite_token'))
                .map(t => t.toJSON());

            const themeBgColors = await getThemeBgColors(user, teams);

            const qs = formatQueryString({
                minLastEditStep,
                offset,
                order,
                orderBy,
                limit,
                ...(search && { search }),
                ...(!search && { folderId: folderId || 'null' }),
                ...(!search && teamId && { teamId })
            });
            const charts = await api(`/charts?${qs}`);
            if (groupBy) {
                charts.list = groupCharts({ charts: charts.list, groupBy, __, visualizations });
            }

            const folders = await getFolders(user, teams);

            return h.view('archive/Index.svelte', {
                htmlClass: 'has-background-white-bis',
                props: {
                    apiQuery: query,
                    charts,
                    teamId,
                    folderId,
                    folders,
                    teams,
                    themeBgColors,
                    visualizations
                }
            });
        }

        async function getThemeBgColors(user, teams) {
            // query list of themes used by the user+team
            const themeIds = (
                await Chart.findAll({
                    attributes: ['theme'],
                    where: {
                        deleted: 0,
                        [db.Op.or]: [
                            {
                                author_id: user.id,
                                organization_id: null
                            },
                            {
                                organization_id: teams.map(t => t.id)
                            }
                        ]
                    },
                    group: ['chart.theme']
                })
            ).map(d => d.theme);

            // query background colors for each theme
            const bgColQuery = db.fn(
                'json_extract',
                db.col('data'),
                db.literal('"$.style.body.background"')
            );
            const bgColors = (
                await Theme.findAll({
                    attributes: ['id', [bgColQuery, 'bg']],
                    where: {
                        [db.Op.and]: [
                            {
                                id: themeIds
                            },
                            db.where(bgColQuery, {
                                [db.Op.not]: null
                            }),
                            db.where(bgColQuery, {
                                [db.Op.ne]: 'transparent'
                            })
                        ]
                    }
                })
            ).map(d => d.toJSON());
            return mapValues(
                keyBy(bgColors, d => d.id),
                d => d.bg
            );
        }

        /*
         * queries user and team folders
         */
        async function getFolders(user, teams) {
            const folders = [
                clean({ id: null, teamId: null, name: 'My archive' }), // user root
                ...(
                    await Folder.findAll({
                        where: {
                            [db.Op.or]: [
                                { user_id: user.id },
                                {
                                    org_id: teams.map(t => t.id)
                                }
                            ]
                        }
                    })
                ).map(clean),
                ...teams.map(team => clean({ id: null, teamId: team.id, name: team.name }))
            ];

            function clean(folder) {
                return {
                    id: folder.id,
                    key: folder.id || folder.teamId || folder.org_id || '$user',
                    teamId: folder.teamId || folder.org_id || null,
                    parentId: folder.parentId || null,
                    name: folder.name
                };
            }
            await addChartCounts(user, teams, folders);
            return keyBy(folders, d => d.key);
        }

        /*
         * queries chart counts and adds them to our folders
         */
        async function addChartCounts(user, teams, folders) {
            const chartCounts = await Chart.findAll({
                attributes: [
                    'in_folder',
                    'organization_id',
                    [db.fn('count', db.literal('*')), 'cnt']
                ],
                where: {
                    last_edit_step: { [db.Op.gte]: minLastEditStep },
                    deleted: false,
                    [db.Op.or]: [
                        { author_id: user.id },
                        {
                            organization_id: teams.map(t => t.id)
                        }
                    ]
                },
                group: ['chart.in_folder', 'chart.organization_id']
            });

            const byTeam = new Map();
            chartCounts.forEach(({ organization_id, in_folder, ...o }) => {
                const tid = organization_id || '--user--';
                const fid = in_folder || 'root';
                if (!byTeam.has(tid)) byTeam.set(tid, new Map());
                byTeam.get(tid).set(fid, o.dataValues.cnt);
            });
            for (const folder of folders) {
                const tid = folder.teamId || '--user--';
                const fid = folder.id || 'root';
                folder.chartCount = byTeam.has(tid) ? byTeam.get(tid).get(fid) || 0 : 0;
            }
        }
    }
};
