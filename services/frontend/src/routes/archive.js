const Joi = require('joi');
const { db } = require('@datawrapper/orm');
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
            search: Joi.string().optional(),
            offset: Joi.number().optional()
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
            const { search } = query;
            const user = auth.artifacts;

            const api = createAPI(
                apiBase,
                config.api.sessionID,
                auth.credentials && auth.credentials.data ? auth.credentials.data.id : ''
            );

            const offset = 0;
            const limit = 15;

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

            const apiQuery = `/charts?minLastEditStep=${minLastEditStep}&offset=${offset}&limit=${limit}&${
                search
                    ? `search=${search}`
                    : `folderId=${folderId ? folderId : 'null'}${teamId ? `&teamId=${teamId}` : ''}`
            }`;
            const charts = await api(apiQuery);

            const folderGroups = await getFolders(user, teams);

            return h.view('archive/Index.svelte', {
                htmlClass: 'has-background-white-bis',
                props: {
                    apiQuery,
                    charts,
                    limit,
                    offset,
                    teamId,
                    folderId,
                    folderGroups,
                    themeBgColors
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
                {
                    teamId: null,
                    folders: [
                        { id: null, teamId: null, name: 'My archive' }, // user root
                        ...(await Folder.findAll({ where: { user_id: user.id } })).map(clean)
                    ]
                }
            ];

            await Promise.all(
                teams.map(team => {
                    return new Promise(resolve => {
                        Folder.findAll({
                            where: { org_id: team.id }
                        }).then(teamFolders => {
                            folders.push({
                                teamId: team.id,
                                folders: [
                                    { id: null, teamId: team.id, name: team.name }, // team root
                                    ...teamFolders.map(clean)
                                ]
                            });
                            resolve();
                        });
                    });
                })
            );
            function clean(folder) {
                folder = folder.toJSON();
                return {
                    id: folder.id,
                    teamId: folder.teamId || folder.org_id,
                    parentId: folder.parentId,
                    name: folder.name
                };
            }
            await addChartCounts(user, teams, folders);
            return folders;
        }

        /*
         * queries chart counts and adds them to our folders
         */
        async function addChartCounts(user, teams, folderGroups) {
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

            for (const group of folderGroups) {
                const tid = group.teamId || '--user--';
                for (const folder of group.folders) {
                    const fid = folder.id || 'root';
                    folder.chartCount = byTeam.has(tid) ? byTeam.get(tid).get(fid) || 0 : 0;
                }
            }
        }
    }
};
