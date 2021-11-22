const Joi = require('joi');
const Boom = require('@hapi/boom');
const { Chart, User, Folder, Team } = require('@datawrapper/orm/models');

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

            const { teams } = await User.findByPk(auth.artifacts.id, {
                include: [{ model: Team, attributes: ['id', 'name'] }]
            });

            const all = [
                {
                    type: 'user',
                    id: auth.artifacts.id,
                    charts: compact
                        ? await countAllCharts({
                              author_id: auth.artifacts.id,
                              in_folder: null,
                              deleted: false
                          })
                        : await findAllCharts({
                              author_id: auth.artifacts.id,
                              in_folder: null,
                              deleted: false
                          }),
                    folders: await getFolders('user_id', auth.artifacts.id)
                }
            ];

            for (const team of teams) {
                all.push({
                    type: 'team',
                    id: team.id,
                    name: team.name,
                    charts: compact
                        ? await countAllCharts({
                              organization_id: team.id,
                              in_folder: null,
                              deleted: false
                          })
                        : await findAllCharts({
                              organization_id: team.id,
                              in_folder: null,
                              deleted: false
                          }),
                    folders: await getFolders('org_id', team.id)
                });
            }

            async function findAllCharts(where) {
                return await Chart.findAll({
                    attributes: ['id', 'title', 'type', 'theme', 'createdAt'],
                    where
                });
            }

            async function countAllCharts(where) {
                return await Chart.count({
                    where
                });
            }

            async function getFolders(by, owner, parent) {
                const arr = [];
                const folders = await Folder.findAll({
                    where: { [by]: owner, parent_id: parent || null }
                });

                for (const folder of folders) {
                    arr.push({
                        id: folder.id,
                        name: folder.name,
                        charts: compact
                            ? await countAllCharts({ in_folder: folder.id, deleted: false })
                            : await findAllCharts({ in_folder: folder.id, deleted: false }),
                        folders: await getFolders(by, owner, folder.id)
                    });
                }

                return arr;
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
