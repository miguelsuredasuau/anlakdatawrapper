const Joi = require('joi');

function createResponseConfig(schema) {
    return {
        sample: process.env.NODE_ENV === 'development' ? 100 : 0,
        ...schema
    };
}

const schemas = { createResponseConfig };

schemas.listResponse = createResponseConfig({
    schema: Joi.object({
        list: Joi.array().items(Joi.object()),
        total: Joi.number().integer(),
        next: Joi.string().optional()
    }).unknown()
});

schemas.noContentResponse = createResponseConfig({
    status: { 204: Joi.any().empty() }
});

schemas.chartResponse = createResponseConfig({
    schema: Joi.object({
        id: Joi.string(),
        title: Joi.string(),
        metadata: Joi.object()
    }).unknown()
});

schemas.teamResponse = createResponseConfig({
    schema: Joi.object({
        id: Joi.string(),
        name: Joi.string()
    }).unknown()
});

schemas.userResponse = createResponseConfig({
    schema: Joi.object({
        id: Joi.number().integer(),
        email: Joi.string()
    }).unknown()
});

schemas.folderResponse = createResponseConfig({
    schema: Joi.object({
        id: Joi.number().integer(),
        name: Joi.string().description('User-defined folder name'),
        userId: Joi.integer()
            .allow(null)
            .description(
                'If set, this is a private folder, and it belongs to the indicated user. If unset, the folder is located in a shared team archive (see `teamId`).'
            ),
        teamId: Joi.integer()
            .allow(null)
            .description('The team that this folder is in. If unset, this folder is private.'),
        parentId: Joi.integer()
            .allow(null)
            .description(
                "The id of the folder that this folder is in. If 'null', the folder is in the root of either a team, or your private charts. (See `userId` and `teamId`, to determine which)"
            ),
        children: Joi.array()
            .items(
                Joi.object({
                    id: Joi.integer()
                })
            )
            .description('List of top-level subfolders of this folder.'),
        charts: Joi.array()
            .items(
                Joi.object({
                    id: Joi.string()
                })
            )
            .description(
                'List of visualizations in this folder. To access the visualizations in subfolders of this folder, those folders must be queried separately.'
            )
    })
});

module.exports = schemas;
