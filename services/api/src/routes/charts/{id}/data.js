const Joi = require('joi');
const Boom = require('@hapi/boom');
const { noContentResponse } = require('../../../utils/schemas');

module.exports = server => {
    const { events, event } = server.app;

    // GET /v3/charts/{id}/data
    server.route({
        method: 'GET',
        path: '/data',
        options: {
            tags: ['api'],
            description: 'Fetch chart data',
            notes: `Request the data of a chart, which is usually a CSV. Requires scope \`chart:read\`.`,
            auth: {
                strategy: 'guest',
                access: { scope: ['chart:read'] }
            },
            plugins: {
                'hapi-swagger': {
                    produces: ['text/csv', 'application/json']
                }
            },
            validate: {
                params: Joi.object({
                    id: Joi.string().length(5).required()
                })
            }
        },
        handler: getChartData
    });

    // PUT /v3/charts/{id}/data
    server.route({
        method: 'PUT',
        path: '/data',
        options: {
            tags: ['api'],
            description: 'Upload chart data',
            notes: `Upload data for a chart or map. Requires scope \`chart:write\`.`,
            auth: {
                strategy: 'guest',
                access: { scope: ['chart:write'] }
            },
            plugins: {
                'hapi-swagger': {
                    consumes: ['text/csv', 'application/json']
                }
            },
            validate: {
                params: Joi.object({
                    id: Joi.string().length(5).required()
                }),
                payload: [
                    Joi.string().description(
                        'An asset used by the chart such as CSV data or custom JSON map.'
                    ),
                    Joi.object()
                ]
            },
            response: noContentResponse,
            payload: {
                maxBytes: 2048 * 1024, // 2MiB
                defaultContentType: 'text/csv',
                allow: ['text/csv', 'application/json']
            }
        },
        handler: writeChartData
    });

    // POST /v3/charts/{id}/data/refresh
    server.route({
        method: 'POST',
        path: '/data/refresh',
        options: {
            tags: ['api'],
            description: "Updates a chart's external data source.",
            notes: `If a chart has an external data source configured, this endpoint fetches the data and saves it to the chart. Requires scope \`chart:write\`.`,
            auth: {
                strategy: 'guest',
                access: { scope: ['chart:read'] }
            },
            validate: {
                params: Joi.object({
                    id: Joi.string().length(5).required()
                })
            }
        },
        handler: async (request, h) => {
            const { params, auth } = request;

            const chart = await server.methods.loadChart(params.id);
            if (!chart) {
                return Boom.notFound();
            }

            const isEditable = await chart.isEditableBy(auth.artifacts, auth.credentials.session);
            if (!isEditable) {
                return Boom.notFound();
            }

            await events.emit(event.CUSTOM_EXTERNAL_DATA, { chart });

            return h.response().code(204);
        }
    });
};

function parseJSON(data) {
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            // Failed to parse JSON.
        }
    }
    return null;
}

async function getChartData(request, h) {
    const { params, query, server } = request;

    const chart = await server.methods.loadChart(params.id);
    if (!chart) {
        return Boom.notFound();
    }

    const csvFilename = `${params.id}.${query.published ? 'public.' : ''}csv`;
    const res = await request.server.inject({
        method: 'GET',
        url: `/v3/charts/${params.id}/assets/${csvFilename}${query.ott ? `?ott=${query.ott}` : ''}`,
        auth: request.auth
    });
    if (res.statusCode !== 404 && res.result.error) {
        return new Boom.Boom(res.result.message, res.result);
    }

    const data = res.statusCode === 404 ? null : res.result;
    const json = parseJSON(data);
    const isJSONObject = typeof json === 'object' && json !== null;
    const contentType = isJSONObject ? 'application/json' : 'text/csv';
    const filename = isJSONObject ? `${params.id}.json` : csvFilename;
    return h
        .response(data)
        .code(200)
        .header('Content-Type', contentType)
        .header('Content-Disposition', filename);
}

async function writeChartData(request, h) {
    const { params } = request;

    const res = await request.server.inject({
        method: 'PUT',
        url: `/v3/charts/${params.id}/assets/${params.id}.csv`,
        auth: request.auth,
        headers: request.headers,
        payload: request.payload
    });

    return h.response(res.result).code(res.statusCode);
}
