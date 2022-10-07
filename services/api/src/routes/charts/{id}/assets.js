const path = require('path');
const mime = require('mime');
const Joi = require('joi');
const Boom = require('@hapi/boom');
const { noContentResponse } = require('../../../utils/schemas');
const { ChartAccessToken } = require('@datawrapper/orm/models');

module.exports = server => {
    // GET /v3/charts/{id}/assets/{asset}
    server.route({
        method: 'GET',
        path: '/assets/{asset}',
        options: {
            tags: ['api'],
            description: 'Fetch chart asset',
            auth: {
                mode: 'try',
                strategy: 'guest'
            },
            notes: `Request an asset associated with a chart. Requires scope \`chart:read\`.`,
            plugins: {
                'hapi-swagger': {
                    produces: ['text/csv', 'application/json']
                }
            },
            validate: {
                params: Joi.object({
                    id: Joi.string().length(5).required(),
                    asset: Joi.string().required().description('Full filename including extension.')
                })
            }
        },
        handler: getChartAsset
    });

    // PUT /v3/charts/{id}/assets/{asset}
    server.route({
        method: 'PUT',
        path: '/assets/{asset}',
        options: {
            tags: ['api'],
            description: 'Upload chart data',
            notes: `Upload data for a chart, which is usually a CSV.
                        An example looks like this: \`/v3/charts/{id}/assets/{id}.csv\`. Requires scope \`chart:write\`.`,
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
                    id: Joi.string().length(5).required(),
                    asset: Joi.string().required().description('Full filename including extension.')
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
        handler: writeChartAsset
    });

    //DELETE /v3/charts/{id}/assets
    server.route({
        method: 'DELETE',
        path: '/assets',
        options: {
            description: 'Delete all chart assets',
            notes: `Deletes all chart assets. It is dedicated to clean up after tests.
                    It should not be used anywhere else
                    since we don't really delete things for security reasons.
                    Only works for charts already marked as deleted.`,
            auth: { access: { scope: ['chart:write'] } },
            validate: {
                params: Joi.object({
                    id: Joi.string().length(5).required()
                })
            }
        },
        handler: deleteChartAssests
    });
};

async function getChartAsset(request, h) {
    const { params, auth, query, server } = request;
    const chart = await server.methods.loadChart(params.id);

    const filename = params.asset;

    if (filename !== `${params.id}.public.csv`) {
        // unauthenticated users can never access non-public assets
        if (!auth.isAuthenticated) {
            return Boom.forbidden();
        }

        // user is authenticated, but we still need to determine if the user has the rights to edit
        let isEditable = await chart.isEditableBy(auth.artifacts, auth.credentials.session);

        if (!isEditable && query.ott) {
            // we do not destroy the access token here, because this request might
            // have been internally injected from the /chart/:id/publish/data endpoint
            const count = await ChartAccessToken.count({
                where: {
                    chart_id: params.id,
                    token: query.ott
                },
                limit: 1
            });

            if (count === 1) {
                isEditable = true;
            }
        }

        if (!isEditable || auth.credentials.scope.indexOf('chart:read') === -1) {
            return Boom.forbidden();
        }
    }

    if (!getAssetWhitelist(params.id).includes(params.asset)) {
        return Boom.badRequest();
    }

    try {
        const contentStream = await server.methods.getChartAsset({
            chart,
            filename,
            asStream: true,
            throwNotFound: true
        });

        const contentType =
            chart.type === 'locator-map' && path.extname(filename) === '.csv'
                ? 'application/json'
                : mime.getType(filename);

        return h
            .response(contentStream)
            .header('Content-Type', contentType)
            .header('Content-Disposition', `attachment; filename=${filename}`);
    } catch (error) {
        if (error.name === 'CodedError' && Boom[error.code]) {
            // this seems to be an orderly error
            return Boom[error.code](error.message);
        }
        request.logger.error(error.message);
        return Boom.badImplementation();
    }
}

function getAssetWhitelist(id) {
    return [
        '{id}.csv',
        '{id}.public.csv',
        '{id}.metadata.json',
        '{id}.map.json',
        '{id}.minimap.json',
        '{id}.highlight.json'
    ].map(name => name.replace('{id}', id));
}

async function writeChartAsset(request, h) {
    const { params, auth, server } = request;
    const user = auth.artifacts;
    const chart = await server.methods.loadChart(request.params.id);

    const isEditable = await chart.isEditableBy(request.auth.artifacts, auth.credentials.session);

    if (!isEditable) {
        return Boom.forbidden();
    }

    if (!getAssetWhitelist(params.id).includes(params.asset)) {
        return Boom.badRequest();
    }

    const filename = params.asset;

    try {
        const { code } = await server.methods.putChartAsset({
            chart,
            data:
                request.headers['content-type'] === 'application/json'
                    ? JSON.stringify(request.payload)
                    : request.payload,
            filename
        });

        // log chart/edit
        await request.server.methods.logAction(user.id, `chart/edit`, chart.id);

        return h.response().code(code);
    } catch (error) {
        request.logger.error(error.message);
        return Boom.notFound();
    }
}

async function deleteChartAssests(request, h) {
    const { auth, server } = request;
    const user = auth.artifacts;

    const { Chart } = require('@datawrapper/orm/models');
    const chart = await Chart.findByPk(request.params.id);
    if (!chart) {
        return Boom.notFound();
    }

    if (!chart.deleted || !user || user.role === 'guest' || !(await user.mayEditChart(chart))) {
        return Boom.forbidden();
    }

    try {
        const { code } = await server.methods.deleteChartAssets({ chart });

        // log chart/assets/delete
        await request.server.methods.logAction(user.id, 'chart/assets/delete', chart.id);

        return h.response().code(code);
    } catch (error) {
        request.logger.error(error.message);
        return Boom.notFound();
    }
}
