const { folderResponse, noContentResponse } = require('../../../schemas/response');
const { Folder, User, Chart } = require('@datawrapper/orm/models');
const { db } = require('@datawrapper/orm');
const { Op } = require('@datawrapper/orm').db;
const Joi = require('joi');
const Boom = require('@hapi/boom');

function serializeWithCharts(folder, charts) {
    return {
        id: folder.id,
        name: folder.name,
        userId: folder.user_id,
        parentId: folder.parent_id,
        teamId: folder.org_id,
        children: folder.children.map(child => ({ id: child.id })),
        charts: charts.map(chart => ({ id: chart.id }))
    };
}

function serialize(folder) {
    return {
        id: folder.id,
        name: folder.name,
        userId: folder.user_id,
        parentId: folder.parent_id,
        teamId: folder.org_id
    };
}

const routes = [
    {
        method: 'GET',
        path: '/',
        scope: 'folder:read',
        description: 'Get a folder',
        notes: `Get a specific folder. Requires scope \`folder:read\`.`,
        response: folderResponse,
        params: Joi.object({
            id: Joi.number().required().description('Folder ID.')
        }),
        async handler(request) {
            const { auth } = request;
            const folder = await Folder.findByPk(request.params.id, {
                include: [{ model: Folder, as: 'children', attributes: ['id'] }]
            });
            if (!folder) {
                return Boom.notFound("Can't access this folder. Folder may not exist.");
            }
            const user = await User.findByPk(auth.artifacts.id);
            if (!(await folder.isWritableBy(user))) {
                // 404 is returned instead of 403 to hide the fact that folder exists
                // even though user cannot access it.
                return Boom.notFound("Can't access this folder. Folder may not exist.");
            }
            const charts = await Chart.findAll({
                where: {
                    in_folder: folder.id
                },
                attributes: ['id']
            });

            return serializeWithCharts(folder, charts);
        }
    },
    {
        method: 'DELETE',
        path: '/',
        scope: 'folder:write',
        description: 'Delete a folder',
        notes: `Deletes the specified folder. Requires scope \`folder:write\`.`,
        response: noContentResponse,
        params: Joi.object({
            id: Joi.number().required().description('Folder ID.')
        }),
        async handler(request, h) {
            const { auth } = request;
            const folder = await Folder.findByPk(request.params.id, {
                include: [{ model: Folder, as: 'children', attributes: ['id'] }]
            });
            if (!folder) {
                return Boom.notFound('Cannot access this folder. Folder may not exist.');
            }
            const user = await User.findByPk(auth.artifacts.id);
            if (!(await folder.isWritableBy(user))) {
                // 404 is returned instead of 403 to hide the fact that folder exists
                // even though user cannot access it.
                return Boom.notFound('Cannot access this folder. Folder may not exist.');
            }
            if (folder.children.length) {
                return Boom.forbidden('Cannot delete a folder with sub-folders.');
            }
            // Move charts of folder to parent
            await db.transaction(async t => {
                await Chart.update(
                    { in_folder: folder.parent_id },
                    {
                        where: {
                            in_folder: folder.id
                        },
                        transaction: t
                    }
                );
                await folder.destroy({
                    transaction: t
                });
            });

            return h.response().code(204);
        }
    },
    {
        method: 'PUT',
        path: '/',
        scope: 'folder:write',
        description: 'Updates a folder',
        notes: `Update a folder. Requires scope \`folder:write\`.`,
        response: folderResponse,
        params: Joi.object({
            id: Joi.number().required().description('Folder ID.')
        }),
        payload: Joi.object({
            name: Joi.string().required().description('Folder name.'),
            parentId: Joi.number().allow(null).required().description('Parent folder.'),
            userId: Joi.when('teamId', {
                is: Joi.string(),
                then: Joi.valid(null),
                otherwise: Joi.number()
            })
                .required()
                .description('The user this folder belongs to.'),
            teamId: Joi.string()
                .allow(null)
                .required()
                .description('The team this folder belongs to.')
        }),
        handler: updateFolder
    },
    {
        method: 'PATCH',
        path: '/',
        scope: 'folder:write',
        description: 'Updates a folder',
        notes: `Update a folder. Requires scope \`folder:write\`.`,
        response: folderResponse,
        params: Joi.object({
            id: Joi.number().required().description('Folder ID.')
        }),
        payload: Joi.object({
            name: Joi.string().optional().description('Folder name.'),
            parentId: Joi.number().allow(null).optional().description('Parent folder.'),
            userId: Joi.when('teamId', {
                is: Joi.string(),
                then: Joi.valid(null),
                otherwise: Joi.number()
            })
                .optional()
                .description('The user this folder belongs to.'),
            teamId: Joi.string()
                .allow(null)
                .optional()
                .description('The team this folder belongs to.')
        }),
        handler: updateFolder
    }
];

async function updateFolder(request) {
    const { auth } = request;
    const folder = await Folder.findByPk(request.params.id, {
        include: [{ model: Folder, as: 'children', attributes: ['id'] }]
    });
    if (!folder) {
        return Boom.notFound("Can't access this folder. Folder may not exist.");
    }
    const user = await User.findByPk(auth.artifacts.id);
    if (!(await folder.isWritableBy(user))) {
        // 404 is returned instead of 403 to hide the fact that folder exists
        // even though user cannot access it.
        return Boom.notFound("Can't access this folder. Folder may not exist.");
    }

    const update = {
        name: folder.name,
        parentId: folder.parent_id,
        teamId: folder.org_id,
        userId: folder.user_id,
        ...request.payload
    };
    if (
        update.teamId &&
        update.teamId !== folder.org_id &&
        !(await user.hasActivatedTeam(update.teamId))
    ) {
        return Boom.notFound(
            "Can't move folder to team. Team does not exist or you don't have access to it."
        );
    }

    const possibleDuplicate = await Folder.findOne({
        where: {
            id: {
                [Op.not]: folder.id
            },
            name: update.name,
            ...(update.userId ? { user_id: update.userId } : { user_id: { [Op.is]: null } }),
            ...(update.teamId ? { org_id: update.teamId } : { org_id: { [Op.is]: null } }),
            ...(update.parentId ? { parent_id: update.parentId } : { parent_id: { [Op.is]: null } })
        }
    });
    if (possibleDuplicate) {
        return Boom.conflict('A folder with this name already exists.');
    }

    if (update.parentId) {
        const parentFolder = await Folder.findByPk(update.parentId);
        if (!parentFolder || !(await parentFolder.isWritableBy(user))) {
            return Boom.notFound(
                "The parent folder does not exist or you don't have access to it."
            );
        }
        if (update.parentId === folder.id) {
            return Boom.badRequest('A folder cannot be the parent of itself.');
        }
        if (await parentFolder.hasParent(folder.id)) {
            return Boom.badRequest("You can't move a folder into its own subtree.");
        }
        if (parentFolder.org_id !== update.teamId || parentFolder.user_id !== update.userId) {
            return Boom.badRequest('Ambiguous folder owner.');
        }
    }

    return await db.transaction(async t => {
        // ownership has changed
        if (folder.org_id !== update.teamId || folder.user_id !== update.userId) {
            await propagateOwnershipChange(folder, update.teamId, update.userId, t);
        }

        folder.name = update.name;
        folder.parent_id = update.parentId;
        folder.org_id = update.teamId;
        folder.user_id = update.userId;
        await folder.save({
            transaction: t
        });
        return serialize(folder);
    });
}

async function propagateOwnershipChange(folder, newTeamId, newUserId, transaction) {
    const folderIds = [];
    const queue = [folder];
    while (queue.length > 0) {
        const next = queue.shift();
        folderIds.push(next.id);
        const children = await Folder.findAll({
            where: {
                parent_id: next.id
            },
            transaction
        });
        queue.push(...children);
    }
    await Folder.update(
        { org_id: newTeamId, user_id: newUserId },
        {
            where: {
                id: folderIds
            },
            transaction
        }
    );
    const chartUpdate = { organization_id: newTeamId, author_id: newUserId };
    if (newTeamId !== null) {
        // don't update author ID if team changes
        delete chartUpdate.author_id;
    }
    await Chart.update(chartUpdate, {
        where: {
            in_folder: folderIds
        },
        transaction
    });
}

module.exports = {
    name: 'routes/folders/{id}',
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
    }
};
