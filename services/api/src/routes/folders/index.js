const Joi = require('joi');
const Boom = require('@hapi/boom');
const orm = require('@datawrapper/orm');
const { Chart, User, Folder } = require('@datawrapper/orm/models');

const { listResponse } = require('../../schemas/response');

const routes = [
    {
        method: 'GET',
        path: '/',
        scope: 'folder:read',
        description: 'List folders',
        notes: `Get a list of folders and their associated charts. Requires scope \`folder:read\`.`,
        query: Joi.object({
            compact: Joi.optional().description(
                'If present, the response will only include the number of charts in each folder. Otherwise the response includes the full chart information.'
            )
        }),
        response: listResponse,
        async handler(request) {
            const compact = request.query.compact !== undefined;
            const { auth } = request;
            const { Op } = orm.db;

            const teams = await auth.artifacts.getAcceptedTeams();

            const where = {
                deleted: false,
                [Op.or]: [
                    { author_id: auth.artifacts.id },
                    { organization_id: teams.map(t => t.id) }
                ]
            };

            const charts = compact
                ? await Chart.count({ where, group: ['organization_id', 'in_folder'] })
                : await Chart.findAll({
                      where,
                      attributes: [
                          'id',
                          'title',
                          'type',
                          'theme',
                          'createdAt',
                          'in_folder',
                          'organization_id'
                      ]
                  });

            const folders = (
                await Folder.findAll({
                    where: {
                        [Op.or]: [{ user_id: auth.artifacts.id }, { org_id: teams.map(t => t.id) }]
                    }
                })
            ).map(f => f.toJSON());

            const all = [
                {
                    type: 'user',
                    id: auth.artifacts.id,
                    charts: getCharts(charts, null, null),
                    folders: getFolders(folders, charts, null, null)
                }
            ];

            for (const team of teams) {
                all.push({
                    type: 'team',
                    id: team.id,
                    name: team.name,
                    charts: getCharts(charts, team.id, null),
                    folders: getFolders(folders, charts, team.id, null)
                });
            }

            function getCharts(charts, teamId, folderId) {
                return compact
                    ? charts.find(d => d.organization_id === teamId && d.in_folder === folderId)
                          ?.count || 0
                    : charts
                          .filter(d => d.organization_id === teamId && d.in_folder === folderId)
                          .map(c => ({
                              id: c.id,
                              title: c.title,
                              type: c.type,
                              theme: c.theme,
                              createdAt: c.createdAt
                          }));
            }

            function getFolders(folders, charts, teamId, parentFolderId) {
                return folders
                    .filter(f => f.org_id === teamId && f.parent_id === parentFolderId)
                    .map(folder => ({
                        id: folder.id,
                        name: folder.name,
                        folders: getFolders(folders, charts, teamId, folder.id),
                        charts: getCharts(charts, teamId, folder.id)
                    }))
                    .sort((a, b) => a.id - b.id);
            }

            return {
                list: all,
                total: all.length
            };
        }
    },
    {
        method: 'POST',
        path: '/',
        description: 'Create a folder',
        notes: `Requires scope \`folder:write\`.`,
        scope: 'folder:write',
        payload: Joi.object({
            organizationId: Joi.string()
                .optional()
                .description(`DEPRECATED: use \`teamId\` instead.`),
            teamId: Joi.string()
                .optional()
                .description(
                    `The team that the folder belongs to. If \`teamId\` is empty, the folder will belong to the user directly.`
                ),
            parentId: Joi.number()
                .optional()
                .description('The parent folder that the folder belongs to.'),
            name: Joi.string().required().description('The name of the folder.')
        }),
        async handler(request, h) {
            const { auth, server, payload } = request;
            const isAdmin = server.methods.isAdmin(request);

            const user = await User.findOne({ where: { id: auth.artifacts.id } });

            const folderParams = {
                name: payload.name
            };

            const teamId = payload.teamId || payload.organizationId;
            if (teamId) {
                if (!isAdmin && !(await user.hasActivatedTeam(teamId))) {
                    return Boom.unauthorized('User does not have access to the specified team.');
                }

                folderParams.org_id = teamId;
            } else {
                folderParams.user_id = auth.artifacts.id;
            }

            if (payload.parentId) {
                // check if folder belongs to user to team
                const folder = await Folder.findOne({ where: { id: payload.parentId } });

                if (
                    !folder ||
                    (!isAdmin &&
                        folder.user_id !== auth.artifacts.id &&
                        !(await user.hasActivatedTeam(folder.org_id)))
                ) {
                    return Boom.unauthorized(
                        'User does not have access to the specified parent folder, or it does not exist.'
                    );
                }

                folderParams.org_id = folder.org_id ? folder.org_id : null;
                folderParams.user_id = folder.org_id ? null : folderParams.user_id;
                folderParams.parent_id = folder.id;
            }
            const duplicate = await Folder.findOne({
                where: {
                    ...folderParams
                }
            });
            if (duplicate) {
                return Boom.conflict('A folder with that name already exists.');
            }
            const newFolder = await Folder.create(folderParams);

            return h
                .response({
                    id: newFolder.id,
                    name: newFolder.name,
                    organizationId: newFolder.org_id,
                    teamId: newFolder.org_id,
                    userId: newFolder.user_id,
                    parentId: newFolder.parent_id
                })
                .code(201);
        }
    }
];

module.exports = {
    name: 'routes/folders',
    version: '1.0.0',
    register: server => {
        server.app.scopes.add('folder:read');
        server.app.scopes.add('folder:write');
        routes.forEach(route => {
            server.route({
                method: route.method,
                path: route.path,
                options: {
                    tags: ['api'],
                    description: route.description,
                    notes: route.notes,
                    auth: {
                        access: { scope: [route.scope] }
                    },
                    validate: {
                        params: route.params,
                        query: route.query,
                        payload: route.payload
                    },
                    response: route.response
                },
                handler: route.handler
            });
        });

        server.register(require('./{id}'), {
            routes: {
                prefix: '/{id}'
            }
        });
    }
};
