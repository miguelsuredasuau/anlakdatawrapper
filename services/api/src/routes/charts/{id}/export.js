const Joi = require('joi');
const Boom = require('@hapi/boom');
const { id: logoId } = require('@datawrapper/schemas/themeData/shared');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 16);

const chartExportPayload = useInGetQuery =>
    Joi.object({
        unit: Joi.string().default('px'),
        mode: Joi.string().valid('rgb', 'cmyk').default('rgb'),
        width: Joi.number().min(1).optional(),
        height: Joi.number().min(1).allow('auto'),
        plain: Joi.boolean().default(false),
        scale: Joi.number().default(1),
        zoom: Joi.number().default(2),
        ...(useInGetQuery
            ? {
                  borderWidth: Joi.number(),
                  borderColor: Joi.string(),
                  // download parameter is only available in
                  // GET version of export route
                  download: Joi.boolean().default(false)
              }
            : {
                  border: Joi.object().keys({
                      width: Joi.number(),
                      color: Joi.string().default('auto')
                  })
              }),
        fullVector: Joi.boolean().default(false),
        ligatures: Joi.boolean().default(true),
        transparent: Joi.boolean().default(false),
        logo: Joi.string().optional().valid('auto', 'on', 'off').default('auto'),
        logoId: logoId().optional().allow(null),
        dark: Joi.boolean().default(false)
    });

module.exports = server => {
    // POST /v3/charts/{id}/export/{format}
    server.route({
        method: 'POST',
        path: '/export/{format}',
        options: {
            auth: {
                access: {
                    scope: ['chart:read']
                }
            },
            validate: {
                params: Joi.object({
                    id: Joi.string().length(5).required().description('5 character long chart ID.'),
                    format: Joi.string()
                        .required()
                        .valid(...server.app.exportFormats.values())
                        .description('Export format')
                }),
                payload: chartExportPayload(false)
            }
        },
        handler: exportChart
    });

    // GET /v3/charts/{id}/export/{format}
    server.route({
        method: 'GET',
        path: '/export/{format}',
        options: {
            tags: ['api'],
            description: 'Export chart',
            notes: `Export your chart as image or document for use in print or presentations.
                        Not all formats might be available to you, based on your account. Requires scope \`chart:read\`.`,
            auth: {
                access: {
                    scope: ['chart:read']
                }
            },
            plugins: {
                'hapi-swagger': {
                    produces: ['image/png', 'image/svg+xml', 'application/pdf']
                }
            },
            validate: {
                params: Joi.object({
                    id: Joi.string().length(5).required().description('5 character long chart ID.'),
                    format: Joi.string()
                        .required()
                        .valid(...server.app.exportFormats.values())
                        .description('Export format')
                }),
                query: chartExportPayload(true)
            }
        },
        handler: handleChartExport
    });

    server.route({
        method: 'POST',
        path: '/export/{format}/async',
        options: {
            tags: ['api'],
            description: 'Export chart in async mode',
            notes: `Export your chart as image or document for use in print or presentations. Returns the URL to query the async export status.
                        Not all formats might be available to you, based on your account. Requires scope \`chart:read\`.`,
            auth: {
                access: {
                    scope: ['chart:read']
                }
            },
            validate: {
                params: Joi.object({
                    id: Joi.string().length(5).required().description('5 character long chart ID.'),
                    format: Joi.string()
                        .required()
                        .valid(...server.app.exportFormats.values())
                        .description('Export format')
                }),
                payload: chartExportPayload(false)
            }
        },
        handler: exportChart
    });

    server.route({
        method: 'GET',
        path: '/export/{format}/async/{exportId}',
        options: {
            tags: ['api'],
            description: 'Export chart',
            notes: `After triggering an asynchronous export this route can be used to find out if the export has finished, yet. It returns either the HTTP code 425 to indicate that the export isn't ready or HTTP code 200 along with the export result.`,
            auth: {
                access: {
                    scope: ['chart:read']
                }
            },
            plugins: {
                'hapi-swagger': {
                    produces: ['image/png', 'image/svg+xml', 'application/pdf']
                }
            },
            validate: {
                params: Joi.object({
                    id: Joi.string().length(5).required().description('5 character long chart ID.'),
                    format: Joi.string()
                        .required()
                        .valid(...server.app.exportFormats.values())
                        .description('Export format'),
                    exportId: Joi.string()
                }),
                query: {
                    download: Joi.boolean().default(false)
                }
            },
            handler: handleAsyncExportResult
        }
    });
};

async function exportChart(request, h) {
    const { query, payload, params, auth, logger, server, headers } = request;
    const { events, event } = server.app;
    const user = auth.artifacts;

    const asyncExportCache = getAsyncExportCache(server);

    // authorize user
    const chart = await server.methods.loadChart(params.id);

    const mayEdit = await user.mayEditChart(chart);
    const mayPublish = await chart.isPublishableBy(user);
    if (!mayEdit) return Boom.notFound();
    if (!mayPublish) return Boom.unauthorized();

    // user is authorized to access chart
    // further authoritzation is handled by plugins
    Object.assign(payload, params);

    if (!headers.origin) {
        try {
            // refresh external data
            await server.inject({
                url: `/v3/charts/${payload.id}/data/refresh`,
                method: 'POST',
                auth,
                headers
            });
        } catch (ex) {
            server.logger.debug(
                `Error while injecting POST /v3/charts/${chart.id}/data/refresh request`,
                ex
            );
        }
    }

    if (request.path.endsWith('/async')) {
        // create a random export hash
        const exportId = nanoid();
        // create the export job, but don't wait for it
        await asyncExportCache.set(exportId, {
            chartId: chart.id,
            inProgress: true
        });

        events
            .emit(event.CHART_EXPORT, {
                chart,
                user,
                key: `export-${payload.format}`,
                priority: 5,
                data: payload,
                auth,
                logger,
                returnAsStream: false
            })
            .then(async results => {
                const result = results.find(res => res.status === 'success' && res.data);
                if (result) {
                    await request.server.methods.logAction(
                        user.id,
                        `chart/export/${params.format}`,
                        params.id
                    );

                    asyncExportCache.set(exportId, {
                        chartId: chart.id,
                        inProgress: false,
                        result: result.data
                    });
                }
            })
            .catch(error => {
                asyncExportCache.set(exportId, {
                    chartId: chart.id,
                    inProgress: false,
                    error
                });
            });

        return {
            url: `/v3/charts/${chart.id}/export/${params.format}/async/${exportId}`
        };
    }

    try {
        const result = (
            await events.emit(event.CHART_EXPORT, {
                chart,
                user,
                key: `export-${payload.format}`,
                priority: 5,
                data: payload,
                auth,
                logger
            })
        ).find(res => res.status === 'success' && res.data);

        if (!result) return Boom.badRequest();

        await request.server.methods.logAction(user.id, `chart/export/${params.format}`, params.id);

        return streamExportResult({ h, query, params, result });
    } catch (error) {
        if (error.name === 'CodedError' && Boom[error.code]) {
            // this seems to be an orderly error
            return Boom[error.code](error.message);
        }

        // this is an unexpected error, so let's log it
        request.logger.error(error);
        return Boom.badImplementation();
    }
}

async function handleChartExport(request, h) {
    const { borderWidth, borderColor, ...query } = request.query;
    let border;

    if (borderWidth || borderColor) {
        border = {
            width: borderWidth,
            color: borderColor
        };
    }

    request.payload = Object.assign(query, { border });
    return exportChart(request, h);
}

async function handleAsyncExportResult(request, h) {
    const { query, params, logger, server } = request;
    const { events, event } = server.app;

    const asyncExportCache = getAsyncExportCache(server);

    const status = await asyncExportCache.get(params.exportId);
    if (!status) {
        return Boom.notFound();
    }
    // knowing the random hash assigned to the export
    // job is enough authorization

    if (status.inProgress) {
        return Boom.tooEarly('please try again later, the export is not ready, yet.');
    } else if (status.error) {
        const { error } = status;
        if (error.name === 'CodedError' && Boom[error.code]) {
            // this seems to be an orderly error
            return Boom[error.code](error.message);
        }

        // this is an unexpected error, so let's log it
        logger.error(error);
        return Boom.badImplementation();
    } else {
        const result = (await events.emit(event.CHART_EXPORT_STREAM, status.result)).find(
            res => res.status === 'success' && res.data
        );
        if (!result) {
            return Boom.badImplementation();
        }
        return streamExportResult({ h, params, query, result: result });
    }
}

function streamExportResult({ h, query, params, result }) {
    const { stream, type } = result.data;

    if (query.download || params.format === 'zip') {
        return h
            .response(stream)
            .header('Content-Disposition', `attachment; filename="${params.id}.${params.format}"`);
    } else {
        return h.response(stream).header('Content-Type', type);
    }
}

function getAsyncExportCache(server) {
    return server.cache({
        segment: 'chart-exports',
        expiresIn: 86400000 /* 1 day */,
        shared: true
    });
}
