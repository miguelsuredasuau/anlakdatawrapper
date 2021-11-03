const Joi = require('joi');
const { Op, literal } = require('@datawrapper/orm').db;
const { decamelizeKeys, decamelize } = require('humps');
const set = require('lodash/set');
const Boom = require('@hapi/boom');
const { Chart, User, Folder, Team, UserTeam } = require('@datawrapper/orm/models');
const { prepareChart } = require('../../utils/index.js');
const { listResponse, chartResponse } = require('../../schemas/response');
const createChart = require('@datawrapper/service-utils/createChart');

const authorIdFormats = [
    Joi.number().integer().description('User id of visualization author'),
    Joi.string().valid('all').description('Search through all visualizations (admins only)'),
    Joi.string()
        .valid('me')
        .description('Search through visualziations created by the authenticated user')
];

module.exports = {
    name: 'routes/charts',
    version: '1.0.0',
    register(server) {
        server.app.scopes.add('chart:read');
        server.app.scopes.add('chart:write');
        server.route({
            method: 'GET',
            path: '/',
            options: {
                tags: ['api'],
                description: 'List charts',
                auth: {
                    access: { scope: ['chart:read'] }
                },
                notes: `Search and filter a list of your charts.
                        The returned chart objects, do not include the full chart metadata.
                        To get the full metadata use [/v3/charts/{id}](ref:getchartsid).  Requires scope \`chart:read\`.`,
                validate: {
                    query: Joi.object({
                        userId: Joi.alternatives(...authorIdFormats).description(
                            'DEPRECATED: use authorId instead.'
                        ),
                        authorId: Joi.alternatives(...authorIdFormats).description(
                            'ID of the user to fetch charts for.'
                        ),
                        published: Joi.boolean().description(
                            'Flag to filter results by publish status'
                        ),
                        search: Joi.string().description(
                            'Search for charts with a specific title.'
                        ),
                        folderId: Joi.alternatives(
                            Joi.number()
                                .integer()
                                .description('List visualizations inside a specific folder'),
                            Joi.string().valid('null')
                        ),
                        teamId: Joi.string().description(
                            'List visualizations belonging to a specific team'
                        ),
                        order: Joi.string()
                            .uppercase()
                            .valid('ASC', 'DESC')
                            .default('DESC')
                            .description('Result order (ascending or descending)'),
                        orderBy: Joi.string()
                            .valid('createdAt', 'lastModifiedAt', 'publishedAt', 'title')
                            .default('createdAt')
                            .description('Attribute to order by'),
                        limit: Joi.number()
                            .integer()
                            .default(100)
                            .description('Maximum items to fetch. Useful for pagination.'),
                        offset: Joi.number()
                            .integer()
                            .default(0)
                            .description('Number of items to skip. Useful for pagination.'),
                        minLastEditStep: Joi.number()
                            .integer()
                            .min(0)
                            .max(5)
                            .description(
                                "Filter visualizations by the last editor step they've been opened in (1=upload, 2=describe, 3=visualize, etc)"
                            )
                    })
                },
                response: listResponse
            },
            handler: getAllCharts
        });

        server.route({
            method: 'POST',
            path: '/',
            options: {
                tags: ['api'],
                description: 'Create new visualization',
                notes: 'Requires scope `chart:write`.',
                auth: {
                    access: { scope: ['chart:write'] }
                },
                validate: {
                    payload: Joi.object({
                        title: Joi.string()
                            .example('My cool chart')
                            .description(
                                'Title of your visualization. This will be the visualization headline.'
                            )
                            .allow(''),
                        theme: Joi.string()
                            .example('datawrapper')
                            .description('Chart theme to use.'),
                        type: Joi.string()
                            .example('d3-lines')
                            .description(
                                'Type of the visualization, like line chart, bar chart, ... Type keys can be found [here].'
                            ),
                        forkable: Joi.boolean().description(
                            'Set to true if you want to allow other users to fork this visualization'
                        ),
                        organizationId: Joi.string().description(
                            'ID of the team (formerly known as organization) that the visualization should be created in.  The authenticated user must have access to this team.'
                        ),
                        folderId: Joi.number()
                            .integer()
                            .description(
                                'ID of the folder that the visualization should be created in. The authenticated user must have access to this folder.'
                            ),
                        externalData: Joi.string().description('URL of external dataset'),
                        language: Joi.string()
                            .regex(/^[a-z]{2}([_-][A-Z]{2})?$/)
                            .description('Visualization locale (e.g. en-US)'),
                        lastEditStep: Joi.number()
                            .integer()
                            .min(1)
                            .max(4)
                            .description('Current position in chart editor workflow'),
                        metadata: Joi.object({
                            axes: Joi.alternatives().try(
                                Joi.object().description(
                                    'Mapping of dataset columns to visualization "axes"'
                                ),
                                Joi.array().length(0)
                            ), // empty array can happen due to PHP's array->object confusion
                            data: Joi.object({
                                transpose: Joi.boolean()
                            }).unknown(true),
                            describe: Joi.object({
                                intro: Joi.string()
                                    .description('The visualization description')
                                    .allow(''),
                                byline: Joi.string()
                                    .description('Byline as shown in the visualization footer')
                                    .allow(''),
                                'source-name': Joi.string()
                                    .description('Source as shown in visualization footer')
                                    .allow(''),
                                'source-url': Joi.string()
                                    .description('Source URL as shown in visualization footer')
                                    .allow(''),
                                'aria-description': Joi.string()
                                    .description(
                                        'Alternative description of visualization shown in screen readers (instead of the visualization)'
                                    )
                                    .allow('')
                            }).unknown(true),
                            annotate: Joi.object({
                                notes: Joi.string()
                                    .description('Notes as shown underneath visualization')
                                    .allow('')
                            }).unknown(true),
                            publish: Joi.object(),
                            custom: Joi.object()
                        })
                            .description(
                                'Metadata that saves all visualization specific settings and options.'
                            )
                            .unknown(true)
                    }).allow(null)
                },
                response: chartResponse
            },
            handler: createChartHandler
        });

        server.register(require('./{id}'), {
            routes: {
                prefix: '/{id}'
            }
        });
    }
};

async function getAllCharts(request) {
    const { query, url, auth } = request;
    const isAdmin = request.server.methods.isAdmin(request);
    const general = request.server.methods.config('general');

    if (!query.authorId && query.userId) {
        // we renamed userId to authorId but want to be downwards compatible
        query.authorId = query.userId;
    }

    const options = {
        order: [[decamelize(query.orderBy), query.order]],
        attributes: [
            'id',
            'title',
            'type',
            'createdAt',
            'in_folder',
            'author_id',
            'organization_id',
            'last_modified_at',
            'public_version',
            'published_at',
            'theme',
            'language'
        ],
        where: {},
        limit: query.limit,
        offset: query.offset
    };

    const filters = [
        {
            deleted: false
        }
    ];

    if (query.teamId) {
        if (isAdmin) {
            // check that team exists
            const c = await Team.count({ where: { id: query.teamId } });
            if (c !== 1) return Boom.notFound();
        } else {
            // check that authenticated user is part of that team (or admin)
            if (!(await auth.artifacts.hasActivatedTeam(query.teamId))) return Boom.notAcceptable();
        }
    }

    if (!isAdmin && query.authorId === 'all') {
        // only admins may user authorId=all
        return Boom.unauthorized();
    }

    if (query.authorId === 'me') {
        query.authorId = auth.artifacts.id;
    }

    if (!isAdmin && query.authorId && query.authorId !== auth.artifacts.id) {
        // non-admins may only pass their own user id
        return Boom.notAcceptable();
    }

    if (isAdmin && query.authorId && query.authorId !== 'all' && query.authorId !== 'me') {
        // check that user exists
        const c = await User.count({ where: { id: query.authorId, deleted: false } });
        if (c !== 1) return Boom.notFound();
    }

    // Limit scope to accessible charts
    if (auth.artifacts.role === 'guest') {
        // guest users can only see their guest session charts
        filters.push({
            guest_session: auth.credentials.session
        });
    } else if (isAdmin && query.authorId === 'all') {
        if (query.teamId) {
            // search only by team
            filters.push({
                organization_id: query.teamId
            });
        }
    } else if (query.teamId && query.authorId) {
        // special case, filter user charts in a team
        // e.g. ?teamId=foo&authorId=me
        filters.push({ organization_id: query.teamId });
        filters.push({ author_id: query.authorId });
    } else if (query.teamId) {
        // filter all charts in specific team, regardless of authorship
        // ?teamId=foo
        filters.push({ organization_id: query.teamId });
    } else if (query.authorId) {
        // filter all private charts for specific user, excluding team
        // ?teamId=foo
        filters.push({ author_id: query.authorId });
    } else {
        // default, search through all my charts and team charts
        // no author or team filter, include all
        const activeUserTeams = await UserTeam.findAll({
            where: {
                user_id: auth.artifacts.id,
                invite_token: ''
            }
        });
        filters.push({
            [Op.or]: [
                { author_id: auth.artifacts.id },
                { organization_id: activeUserTeams.map(t => t.organization_id) }
            ]
        });
    }

    if (isAdmin) {
        set(options, ['include'], [{ model: User, attributes: ['name', 'email'] }]);
    }

    // Additional filters

    if (query.published) {
        // A chart is published when it's public_version is > 0.
        filters.push({
            public_version: { [Op.gt]: 0 }
        });
    }

    if (query.search) {
        const search = [
            literal(
                `MATCH(title, keywords) AGAINST ('${query.search.replace(
                    /'/g,
                    ''
                )}' IN BOOLEAN MODE)`
            )
        ];
        filters.push({
            [Op.or]: search
        });
    }

    if (query.folderId) {
        if (query.folderId === 'null') {
            filters.push({
                in_folder: { [Op.is]: null }
            });
        } else {
            // check folder permission
            const folder = await Folder.findByPk(query.folderId);
            if (!folder) return Boom.notAcceptable();
            if (!(await folder.isWritableBy(auth.artifacts)) && !isAdmin) {
                return Boom.notAcceptable();
            }
            if (query.teamId && folder.org_id && folder.org_id !== query.teamId) {
                // tried to combine a folder with a different team
                return Boom.notAcceptable();
            }
            filters.push({
                in_folder: query.folderId
            });
        }
    }

    if (query.minLastEditStep) {
        filters.push({
            last_edit_step: {
                [Op.gte]: query.minLastEditStep
            }
        });
    }

    options.where = { [Op.and]: filters };

    // extra pre-caution for essentially unlimited "all" queries
    // sorting the response would put a lot of load on our DB
    if (isAdmin && query.authorId === 'all' && !query.folderId && !query.teamId) {
        if (!query.search) {
            return Boom.notImplemented('Please filter the query by folderId, teamId or search');
        }
        // count search results
        const resultCount = await Chart.count({ where: options.where });
        if (resultCount > 10000) {
            return Boom.notAcceptable('Please provide a more specific search query');
        } else if (resultCount > 1000) {
            // disable sorting for too large result sets
            delete options.order;
        }
    }

    const { count, rows } = await Chart.findAndCountAll(options);

    const charts = [];

    for (const chart of rows) {
        charts.push({
            ...(await prepareChart(chart)),
            thumbnails: general.imageDomain
                ? {
                      full: `//${general.imageDomain}/${
                          chart.id
                      }/${chart.getThumbnailHash()}/full.png`,
                      plain: `//${general.imageDomain}/${
                          chart.id
                      }/${chart.getThumbnailHash()}/plain.png`
                  }
                : undefined,
            url: `${url.pathname}/${chart.id}`
        });
    }

    const chartList = {
        list: charts,
        total: count
    };

    if (query.limit + query.offset < count) {
        const nextParams = new URLSearchParams({
            ...query,
            offset: query.limit + query.offset,
            limit: query.limit
        });

        set(chartList, 'next', `${url.pathname}?${nextParams.toString()}`);
    }

    return chartList;
}

async function createChartHandler(request, h) {
    const { url, auth, payload, server } = request;
    const { session, token } = auth.credentials;
    const user = auth.artifacts;

    const newChart = {
        title: '',
        type: 'd3-bars',
        ...decamelizeKeys(payload),
        folderId: payload ? payload.folderId : undefined,
        teamId: payload ? payload.organizationId : undefined,
        metadata: payload && payload.metadata ? payload.metadata : { data: {} }
    };
    const chart = await createChart({ server, user, payload: newChart, session, token });

    // log chart/edit
    await request.server.methods.logAction(auth.artifacts.id, `chart/edit`, chart.id);

    return h
        .response({ ...(await prepareChart(chart)), url: `${url.pathname}/${chart.id}` })
        .code(201);
}
