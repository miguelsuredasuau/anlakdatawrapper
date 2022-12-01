const Boom = require('@hapi/boom');
const Joi = require('joi');
const OpenSearchClient = require('../../utils/openSearchClient.js');
const set = require('lodash/set');
const { SQ } = require('@datawrapper/orm');
const { Op } = SQ;
const { Chart, Folder, ReadonlyChart, Team, User } = require('@datawrapper/orm/db');
const { chartListResponse } = require('../../utils/schemas');
const { prepareChart } = require('../../utils/index.js');

const authorIdFormats = [
    Joi.number().integer().description('User id of visualization author'),
    Joi.string().valid('all').description('Search through all visualizations (admins only)'),
    Joi.string()
        .valid('me')
        .description('Search through visualizations created by the authenticated user')
];

function getSortOptions(order) {
    return {
        authorId: [{ author_id: order }, { created_at: 'desc' }],
        createdAt: [{ created_at: order }],
        lastEditStep: [{ last_edit_step: order }, { created_at: 'desc' }],
        lastModifiedAt: [{ last_modified_at: order }],
        publishedAt: [{ published_at: order }],
        title: [{ 'title.keyword': order }, { created_at: 'desc' }],
        type: [{ type: order }, { created_at: 'desc' }]
    };
}

module.exports = {
    name: 'routes/search',
    version: '1.0.0',
    register(server) {
        server.route({
            method: 'GET',
            path: '/charts',
            options: {
                // tags: ['api'],
                description: 'Search charts',
                auth: {
                    access: { scope: ['chart:read'] }
                },
                notes: `Search and filter a list of your charts.
                        The returned chart objects do not include the full chart metadata.
                        To get the full metadata use [/v3/charts/{id}](ref:getchartsid).  Requires scope \`chart:read\`.`,
                validate: {
                    query: Joi.object({
                        query: Joi.string().description('Search charts for a specific term'),
                        authorId: Joi.alternatives(...authorIdFormats).description(
                            'ID of the user to fetch charts for.'
                        ),
                        published: Joi.boolean().description(
                            'Flag to filter results by publish status'
                        ),
                        folderId: Joi.alternatives(
                            Joi.number()
                                .integer()
                                .description('List visualizations inside a specific folder'),
                            Joi.string().valid('null')
                        ),
                        teamId: Joi.string().description(
                            'List visualizations belonging to a specific team. Use teamId=null to search for user visualizations not part of a team'
                        ),
                        minLastEditStep: Joi.number()
                            .integer()
                            .min(0)
                            .max(5)
                            .description(
                                "Filter visualizations by the last editor step they've been opened in (1=upload, 2=describe, 3=visualize, etc)"
                            ),
                        order: Joi.string()
                            .uppercase()
                            .valid('ASC', 'DESC')
                            .default('DESC')
                            .description('Result order (ascending or descending)'),
                        orderBy: Joi.string()
                            .valid(...Object.keys(getSortOptions()))
                            .default('createdAt')
                            .description('Attribute to order by'),
                        limit: Joi.number()
                            .integer()
                            .min(1)
                            .default(100)
                            .description('Maximum items to fetch. Useful for pagination.'),
                        offset: Joi.number()
                            .integer()
                            .min(0)
                            .default(0)
                            .description('Number of items to skip. Useful for pagination.')
                    })
                },
                response: chartListResponse
            },
            handler: findOrSearchCharts
        });

        server.route({
            method: 'GET',
            path: '/charts/health',
            options: {
                auth: {
                    strategy: 'admin',
                    access: { scope: ['chart:read'] }
                },
                validate: {
                    query: Joi.object({
                        maxPending: Joi.number()
                            .min(0)
                            .default(100)
                            .description(
                                'Maximum healthy number of most recents charts edits that have not been indexed'
                            ),
                        minRatio: Joi.number()
                            .min(0)
                            .max(1)
                            .default(1)
                            .description(
                                'Minimum healthy ratio between the number of existing and indexed charts'
                            )
                    })
                }
            },
            handler: getChartsHealth
        });
    }
};

async function findCharts({ query, request }) {
    const queryParams = new URLSearchParams({
        search: query.query,
        orderBy: query.orderBy,
        order: query.order,
        limit: query.limit,
        offset: query.offset
    });

    const res = await request.server.inject({
        method: 'GET',
        url: `/v3/charts?${queryParams}`,
        auth: request.auth,
        headers: request.headers
    });
    if (res.statusCode >= 400) {
        return Boom.boomify(res.result);
    }

    return res.result;
}

async function searchCharts({ query, request, openSearchClient }) {
    const { url, auth } = request;
    const isAdmin = request.server.methods.isAdmin(request);
    const general = request.server.methods.config('general');

    const options = {
        sort: getSortOptions(query.order.toLowerCase())[query.orderBy],
        from: query.offset,
        size: query.limit
    };

    const filters = [
        {
            term: {
                deleted: { value: false }
            }
        }
    ];

    if (query.teamId && query.teamId !== 'null') {
        if (isAdmin) {
            // check that team exists
            const c = await Team.count({ where: { id: query.teamId } });
            if (c !== 1) return Boom.notFound();
        } else {
            // check that authenticated user is part of that team (or admin)
            if (!(await auth.artifacts.hasActivatedTeam(query.teamId))) return Boom.forbidden();
        }
    }

    if (!isAdmin && query.authorId === 'all') {
        // only admins may user authorId=all
        return Boom.forbidden();
    }

    if (query.authorId === 'me') {
        query.authorId = auth.artifacts.id;
    }

    if (!isAdmin && query.authorId && query.authorId !== auth.artifacts.id) {
        // non-admins may only pass their own user id
        return Boom.forbidden();
    }

    if (isAdmin && query.authorId && query.authorId !== 'all' && query.authorId !== 'me') {
        // check that user exists
        const c = await User.count({ where: { id: query.authorId, deleted: false } });
        if (c !== 1) return Boom.notFound();
    }

    if (isAdmin && query.authorId === 'all') {
        if (query.teamId) {
            // search only by team
            if (query.teamId === 'null') {
                filters.push({
                    bool: {
                        must_not: {
                            exists: { field: 'team_id' }
                        }
                    }
                });
            } else {
                filters.push({
                    term: {
                        team_id: { value: query.teamId }
                    }
                });
            }
        }
    } else if (query.teamId || query.authorId) {
        // special case, filter user charts in a team
        // e.g. ?teamId=foo&authorId=me
        if (query.teamId) {
            if (query.teamId === 'null') {
                filters.push({
                    bool: {
                        must_not: {
                            exists: { field: 'team_id' }
                        }
                    }
                });
            } else {
                filters.push({
                    term: {
                        team_id: { value: query.teamId }
                    }
                });
            }
        }
        if (query.authorId) {
            filters.push({
                term: {
                    author_id: { value: query.authorId }
                }
            });
        }
    } else {
        // default, search through all my charts and team charts
        // no author or team filter, include all
        filters.push({
            dis_max: {
                queries: [
                    {
                        term: {
                            author_id: { value: auth.artifacts.id }
                        }
                    },
                    {
                        terms: {
                            team_id: await auth.artifacts.getActiveTeamIds()
                        }
                    }
                ]
            }
        });
    }

    // Additional filters

    if (query.published) {
        // A chart is published when it's public_version is > 0.
        filters.push({
            range: {
                public_version: { gt: 0 }
            }
        });
    }

    filters.push({
        simple_query_string: {
            query: query.query,
            fields: [
                'aria_description',
                'byline',
                'id',
                'intro',
                'notes',
                'source_name',
                'source_url',
                'title',
                'custom_fields.*'
            ],
            default_operator: 'and'
        }
    });

    if (query.folderId) {
        if (query.folderId === 'null') {
            filters.push({
                bool: {
                    must_not: {
                        exists: { field: 'in_folder' }
                    }
                }
            });
        } else {
            // check folder permission
            const folder = await Folder.findByPk(query.folderId);
            if (!folder) return Boom.forbidden();
            if (!(await folder.isWritableBy(auth.artifacts)) && !isAdmin) {
                return Boom.forbidden();
            }
            if (query.teamId && folder.org_id && folder.org_id !== query.teamId) {
                // tried to combine a folder with a different team
                return Boom.forbidden();
            }
            filters.push({
                term: {
                    in_folder: { value: query.folderId }
                }
            });
        }
    }

    if (query.minLastEditStep) {
        filters.push({
            range: {
                last_edit_step: { gte: query.minLastEditStep }
            }
        });
    }

    options.query = { bool: { must: filters } };

    const res = await openSearchClient.search(options);

    const count = res.hits.total.value;
    const charts = await Promise.all(
        res.hits.hits.map(async hit => {
            const chart = ReadonlyChart.build({ id: hit._id });
            chart.dataValues = {
                author_id: hit._source.author_id,
                createdAt: new Date(hit._source.created_at), // Necessary for getThumbnailHash() to work.
                created_at: new Date(hit._source.created_at),
                id: hit._id,
                last_modified_at: new Date(hit._source.last_modified_at),
                in_folder: hit._source.in_folder,
                language: hit._source.language,
                last_edit_step: hit._source.last_edit_step,
                metadata: {
                    annotate: {
                        notes: hit._source.notes
                    },
                    custom: hit._source.custom_fields, // Notice that we don't use the team-custom-fields plugin but instead always ingest and return custom fields.
                    describe: {
                        'aria-description': hit._source.aria_description,
                        byline: hit._source.byline,
                        intro: hit._source.intro,
                        'source-name': hit._source.source_name,
                        'source-url': hit._source.source_url
                    }
                },
                organization_id: hit._source.team_id,
                public_version: hit._source.public_version,
                published_at: hit._source.published_at && new Date(hit._source.published_at),
                theme: hit._source.theme,
                title: hit._source.title,
                type: hit._source.type
            };
            return {
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
                url: `/v3/charts/${chart.id}`
            };
        })
    );

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

function findOrSearchCharts(request) {
    const { query } = request;
    const isAdmin = request.server.methods.isAdmin(request);

    if (!query.authorId && query.userId) {
        // we renamed userId to authorId but want to be downwards compatible
        query.authorId = query.userId;
    }

    if (query.query) {
        let openSearchClient;
        try {
            openSearchClient = new OpenSearchClient(request.server.methods.config('opensearch'));
        } catch (e) {
            // Missing or invalid OpenSearch config.
        }
        if (openSearchClient) {
            return searchCharts({ query, isAdmin, request, openSearchClient });
        }
    }
    return findCharts({ query, isAdmin, request });
}

async function findDatabaseStats() {
    const count = await Chart.count();
    const lastChart = await Chart.findOne({ order: [['last_modified_at', 'DESC']], limit: 1 });
    const lastModifiedAt = lastChart ? lastChart.last_modified_at : new Date(0);
    return { count, lastModifiedAt };
}

async function findOpenSearchStats(openSearchClient) {
    const count = await openSearchClient.count();
    const res = await openSearchClient.search({
        sort: { last_modified_at: 'desc' },
        size: 1
    });
    const lastModifiedAt = res.hits.total.value
        ? new Date(res.hits.hits[0]._source.last_modified_at)
        : new Date(0);
    return { count, lastModifiedAt };
}

async function getChartsHealth(request, h) {
    const { server, query } = request;

    let openSearchClient;
    try {
        openSearchClient = new OpenSearchClient(server.methods.config('opensearch'));
    } catch (e) {
        return Boom.notImplemented(e.message);
    }

    const [databaseStats, openSearchStats] = await Promise.all([
        findDatabaseStats(),
        findOpenSearchStats(openSearchClient)
    ]);

    const { maxPending, minRatio } = query;
    const ratio = databaseStats.count ? openSearchStats.count / databaseStats.count : 0;
    const pending = await Chart.count({
        where: { last_modified_at: { [Op.gt]: openSearchStats.lastModifiedAt } }
    });
    const health = {
        ratio: {
            value: ratio,
            min: minRatio,
            healthy: ratio >= minRatio
        },
        pending: {
            value: pending,
            max: maxPending,
            healthy: pending <= maxPending
        }
    };
    const isHealthy = Object.values(health)
        .map(obj => obj.healthy)
        .every(Boolean);

    return h
        .response({
            database: databaseStats,
            openSearch: openSearchStats,
            health
        })
        .code(isHealthy ? 200 : 555);
}
