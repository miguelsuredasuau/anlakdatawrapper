const Joi = require('joi');

const DW_DEV_MODE = !!JSON.parse(process.env.DW_DEV_MODE || 'false');

function createResponseConfig(schema) {
    return {
        sample: DW_DEV_MODE ? 100 : 0,
        ...schema
    };
}

function createListResponse(items) {
    return createResponseConfig({
        schema: Joi.object({
            list: Joi.array().items(items || Joi.object()),
            total: Joi.number().integer(),
            next: Joi.string().optional()
        }).unknown()
    });
}

const createUserNameSchema = () =>
    Joi.string()
        .allow(null)
        .example('Carol Danvers')
        .pattern(/^[\p{Alpha}\p{N}\p{Emoji}\p{Pd}\s.]+$/u, { name: 'alphanum' });

const chartListItem = Joi.object({
    id: Joi.string().description('ID of the visualization'),
    title: Joi.string().empty('').description('Title of the visualization'),
    publicId: Joi.string().description(
        'Public ID of the visualization. May be different from the internal ID, if *hash publishing* is enabled.'
    ),
    authorId: Joi.number()
        .integer()
        .allow(null)
        .description('ID of user that created the visualization.'),
    organizationId: Joi.string()
        .allow(null)
        .description(
            'ID of the team that the visualization is located in. If `null`, visualization is private.'
        ),
    folderId: Joi.number()
        .integer()
        .allow(null)
        .description(
            'ID of the folder that the visualization is located in. If `null`, visualization is in the root of a team, or your private archive.'
        ),
    language: Joi.string().description('Visualization language (output locale), e.g `en-US`'),
    theme: Joi.string().description('ID of theme applied to the visualization'),
    type: Joi.string().description(
        'Type of visualization, e.g `d3-lines`, `d3-maps-choropleth`, `tables`'
    ),
    createdAt: Joi.date().description('Time and date when the visualization was created.'),
    lastModifiedAt: Joi.date().description('Time and date when the visualization was last edited.'),
    publishedAt: Joi.date()
        .allow(null)
        .description(
            'Time and date when the visualization was last published. `null`, if the visualization has not been published yet.'
        ),
    lastEditStep: Joi.number()
        .integer()
        .min(0)
        .max(5)
        .description(
            'A number encoding which of the editor steps this chart has been edited in so far. 5 = published.'
        ),
    publicVersion: Joi.number()
        .integer()
        .min(0)
        .description('Indicates how many times a visualization has been published.'),
    author: Joi.object({
        name: Joi.string()
            .allow(null)
            .description('Name of the user who created the visualization'),
        email: Joi.string().description('Email address of the user who created the visualization')
    }),
    thumbnails: Joi.object({
        full: Joi.string().description(
            'URL pointing to the most recently generated preview thumbnail for the visualization. (Image includes header & footer).'
        ),
        plain: Joi.string().description(
            'URL pointing to the most recently generated preview thumbnail for the visualization. (Image is just the visualization, without header & footer).'
        )
    }),
    url: Joi.string().description(
        'API URL for the visualization, can be used to retreive additional information, including its metadata.'
    ),
    metadata: Joi.object().description("All of the visualization's settings."),
    guestSession: Joi.string().allow(null).description('Guest session id'),
    customFields: Joi.alternatives()
        .try(Joi.object(), Joi.array().length(0))
        .description('Custom fields')
        .allow(null)
        .optional()
});

const createUserPayload = [
    // normal sign-up
    Joi.object({
        name: createUserNameSchema().description(
            'Name of the user that should get created. This can be omitted.'
        ),
        email: Joi.string()
            .email()
            .required()
            .example('cpt-marvel@shield.com')
            .description('User email address'),
        role: Joi.string().valid('editor', 'admin').description('User role. This can be omitted.'),
        language: Joi.string()
            .example('en_US')
            .description('User language preference. This can be omitted.'),
        password: Joi.string()
            .example('13-binary-1968')
            .min(8)
            .required()
            .description('Strong user password.'),
        invitation: Joi.boolean().valid(false).allow(null)
    }),
    // for invitation sign-ups
    Joi.object({
        email: Joi.string()
            .email()
            .required()
            .example('cpt-marvel@shield.com')
            .description('User email address'),
        invitation: Joi.boolean().valid(true).required(),
        chartId: Joi.string().optional(),
        role: Joi.string().valid('editor', 'admin').description('User role. This can be omitted.')
    })
];

const chartResponse = createResponseConfig({
    schema: chartListItem.keys({
        publicUrl: Joi.string().allow(null).description('URL of published visualization.'),
        deleted: Joi.boolean(),
        deletedAt: Joi.date()
            .allow(null)
            .description('Time and date when the visualization was deleted.'),
        forkable: Joi.boolean().description(
            'Indicates if the visualization has been shared in the Datawrapper River.'
        ),
        isFork: Joi.boolean().description(
            'Indicates if the visualization is a copy of another visualization.'
        ),
        forkedFrom: Joi.string()
            .allow(null)
            .description(
                'ID of the visualization that this visualization was copied from. `null` if it is not a copy.'
            ),
        externalData: Joi.string()
            .allow(null)
            .empty('')
            .description('External data URL, relevant for live visualizations.'),
        metadata: Joi.object().description("All of the visualization's settings."),
        customFields: Joi.alternatives()
            .try(Joi.object(), Joi.array().length(0))
            .description('Custom fields')
            .allow(null)
            .optional(),
        keywords: Joi.string().optional().description('Keywords'),
        utf8: Joi.boolean().optional().description('UTF-8')
    })
});

const teamResponse = createResponseConfig({
    schema: Joi.object({
        id: Joi.string(),
        name: Joi.string()
    }).unknown()
});

const userResponse = createResponseConfig({
    schema: Joi.object({
        id: Joi.number().integer(),
        email: Joi.string()
    }).unknown()
});

const folderResponse = createResponseConfig({
    schema: Joi.object({
        id: Joi.number().integer(),
        name: Joi.string().description('User-defined folder name'),
        userId: Joi.number()
            .integer()
            .allow(null)
            .description(
                'If set, this is a private folder, and it belongs to the indicated user. If unset, the folder is located in a shared team archive (see `teamId`).'
            ),
        teamId: Joi.string()
            .allow(null)
            .description(
                'The ID of the team that this folder is in. If unset, this folder is private.'
            ),
        parentId: Joi.number()
            .integer()
            .allow(null)
            .description(
                "The id of the folder that this folder is in. If 'null', the folder is in the root of either a team, or your private charts. (See `userId` and `teamId`, to determine which)"
            ),
        children: Joi.array()
            .items(
                Joi.object({
                    id: Joi.number().integer()
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

module.exports = {
    createResponseConfig,
    listResponse: createListResponse(),
    chartResponse,
    chartListResponse: createListResponse(chartListItem),
    noContentResponse: createResponseConfig({
        status: { 204: Joi.any().empty() }
    }),
    teamResponse,
    userResponse,
    createUserPayload,
    folderResponse,
    createUserNameSchema
};
