const Joi = require('joi');
const { db } = require('@datawrapper/orm');

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

        const minLastEditStep = 2;

        server.route({
            method: 'GET',
            path: '/{folderId?}',
            options: {
                auth: 'user',
                validate: {
                    params: Joi.object({
                        folderId: Joi.number().integer().optional()
                    })
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
                    })
                },
                handler: visArchiveHandler
            }
        });

        async function visArchiveHandler(request, h) {
            const { auth, params } = request;
            const { teamId, folderId } = params;
            const user = auth.artifacts;

            const api = createAPI(
                apiBase,
                config.api.sessionID,
                auth.credentials && auth.credentials.data ? auth.credentials.data.id : ''
            );

            const offset = 0;
            const limit = 15;

            const charts = await api(
                `/charts?minLastEditStep=${minLastEditStep}&offset=${offset}&limit=${limit}&folderId=${
                    folderId ? folderId : 'null'
                }${teamId ? `&teamId=${teamId}` : ''}`
            );

            const folderGroups = await getFolders(user);

            return h.view('archive/Index.svelte', {
                htmlClass: 'has-background-white-bis',
                props: {
                    charts,
                    limit,
                    offset,
                    teamId,
                    folderId,
                    folderGroups
                }
            });
        }

        /*
         * queries user and team folders
         */
        async function getFolders(user) {
            const folders = [
                {
                    teamId: null,
                    folders: [
                        { id: null, teamId: null, name: 'My archive' }, // user root
                        ...(await Folder.findAll({ where: { user_id: user.id } })).map(clean)
                    ]
                }
            ];

            const teams = (await user.getTeams())
                .filter(d => !d.user_team.getDataValue('invite_token'))
                .map(t => t.toJSON());

            await Promise.all(
                teams.map(team => {
                    return new Promise(resolve => {
                        Folder.findAll({
                            attributes: ['id', 'name'],
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
