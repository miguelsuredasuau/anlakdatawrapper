const Boom = require('@hapi/boom');
const Joi = require('joi');
const { db } = require('@datawrapper/orm');
const { formatQueryString } = require('../utils/url.cjs');
const { getUserLanguage } = require('../utils/index');
const { groupCharts } = require('../utils/charts.cjs');
const keyBy = require('lodash/keyBy');
const mapValues = require('lodash/mapValues');
const { byOrder } = require('../utils');

module.exports = {
    name: 'routes/archive',
    version: '1.0.0',
    register: async server => {
        const config = server.methods.config();

        server.methods.prepareView('archive/Index.svelte');

        const Folder = server.methods.getModel('folder');
        const Team = server.methods.getModel('team');
        const Chart = server.methods.getModel('chart');
        const TeamTheme = server.methods.getModel('team_theme');
        const Theme = server.methods.getModel('theme');

        const validQueryParams = Joi.object({
            groupBy: Joi.string().valid('author', 'status').default(null),
            limit: Joi.number().min(1).max(200).default(96),
            offset: Joi.number().min(0).default(0),
            search: Joi.string().allow('').default(''),
            order: Joi.string().valid('ASC', 'DESC').default('DESC'),
            minLastEditStep: Joi.number().integer().min(0).max(5).default(2),
            orderBy: Joi.string()
                .valid(
                    'authorId',
                    'createdAt',
                    'lastEditStep',
                    'lastModifiedAt',
                    'publishedAt',
                    'title'
                )
                .default('lastModifiedAt')
        });

        // we allow plugins like team-custom-fields to expose additional
        // team settings instead of hard-coding them here
        const pluginTeamSettingsFunctions = [];
        server.method('addPublicTeamSettingsToArchive', func => {
            pluginTeamSettingsFunctions.push(func);
        });

        // we allow plugins like team-custom-fields to display additional
        // view components inside VisualizationBoxes
        const pluginVisualizationBoxSublineFunctions = [];
        server.method('registerArchiveVisualizationBoxSubline', func => {
            pluginVisualizationBoxSublineFunctions.push(func);
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
            const { groupBy, limit, offset, order, orderBy, search, minLastEditStep } = query;
            const user = auth.artifacts;

            const language = getUserLanguage(auth);
            const __ = key => server.methods.translate(key, { scope: 'core', language });

            const api = server.methods.createAPI(request);

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

            const adminAccessingForeignTeam =
                user.isAdmin() && teamId && !user.teams.find(t => t.id === teamId);

            const teams = [
                ...(await user.getAcceptedTeams()),
                ...(adminAccessingForeignTeam ? [await Team.findByPk(teamId)] : [])
            ]
                .filter(Boolean) // Filter out null, because `Team.findByPk(teamId)` can return it.
                .map(t => {
                    const pluginTeamSettings = {};
                    pluginTeamSettingsFunctions.forEach(func => {
                        Object.assign(pluginTeamSettings, func({ request, settings: t.settings }));
                    });
                    return {
                        ...t.toJSON(),
                        settings: {
                            displayLocale: t.settings?.displayLocale || false,
                            ...pluginTeamSettings
                        }
                    };
                });

            const themeBgColors = await getThemeBgColors(
                teams,
                config.general?.defaultThemes || []
            );

            const qs = formatQueryString({
                minLastEditStep,
                offset,
                order,
                orderBy,
                limit,
                ...(search && { search }),
                ...(!search && { folderId: folderId || 'null' }),
                ...(!search && (teamId ? { teamId } : { authorId: 'me', teamId: 'null' }))
            });

            let charts;
            try {
                charts = await api(`/charts?${qs}`);
            } catch {
                // The team probably doesn't exist or the user doesn't have permissions to access
                // it. We can't tell for sure, because the `api()` function doesn't give us access
                // to the API response.
                throw Boom.notFound();
            }

            if (groupBy) {
                charts.list = groupCharts({ charts: charts.list, groupBy, __ });
            }

            if (!charts.list.length && /[a-zA-Z0-9]{5}/.test(search)) {
                // search for specific chart id
                try {
                    const chart = await api(`/charts/${search}`);
                    charts.list.push(chart);
                    charts.total = 1;
                } catch (e) {
                    // ignore error
                }
            }

            const folders = await getFolders(user, teams, minLastEditStep);

            const visBoxSublines = [];
            for (const func of pluginVisualizationBoxSublineFunctions) {
                visBoxSublines.push(await func(request));
            }

            return h.view('archive/Index.svelte', {
                htmlClass: 'has-background-white-bis',
                props: {
                    apiQuery: query,
                    charts,
                    teamId,
                    folderId,
                    folders,
                    teams,
                    foreignTeam: adminAccessingForeignTeam ? teamId : null,
                    minLastEditStep,
                    themeBgColors,
                    visBoxSublines: visBoxSublines.sort(byOrder)
                }
            });
        }

        async function getThemeBgColors(teams, defaultThemes) {
            // query list of themes used by the user+team
            const themeIds = (
                await TeamTheme.findAll({
                    attributes: ['theme_id'],
                    where: {
                        organization_id: teams.map(t => t.id)
                    }
                })
            )
                .map(d => d.theme_id)
                .concat(defaultThemes);
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
        async function getFolders(user, teams, minLastEditStep) {
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
                    name: folder.name,
                    path: getFolderUri(folder)
                };
            }
            await addChartCounts(user, teams, folders, minLastEditStep);
            return keyBy(folders, d => d.key);
        }

        /*
         * queries chart counts and adds them to our folders
         */
        async function addChartCounts(user, teams, folders, minLastEditStep) {
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
            chartCounts.forEach(({ organization_id: teamId, in_folder: inFolder, ...o }) => {
                const tid = teamId || '--user--';
                const fid = inFolder || 'root';
                if (!byTeam.has(tid)) byTeam.set(tid, new Map());
                byTeam.get(tid).set(fid, o.dataValues.cnt);
            });
            for (const folder of folders) {
                const tid = folder.teamId || '--user--';
                const fid = folder.id || 'root';
                folder.chartCount = byTeam.has(tid) ? byTeam.get(tid).get(fid) || 0 : 0;
            }
        }

        function getFolderUri(folder) {
            const parts = ['archive'];
            if (folder.teamId) {
                parts.push('team');
                parts.push(folder.teamId);
            }
            if (folder.id) parts.push(folder.id);
            return `/${parts.join('/')}`;
        }
    }
};
