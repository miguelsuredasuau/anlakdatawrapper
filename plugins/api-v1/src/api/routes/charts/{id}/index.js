const Boom = require('@hapi/boom');
const assign = require('assign-deep');

module.exports = {
    name: 'api-v1/charts/:id',
    register: async server => {
        server.route({
            method: 'GET',
            path: '/{id}',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                try {
                    const res = await request.server.inject({
                        method: 'GET',
                        url: `/v3/charts/${request.params.id}`,
                        auth: request.auth,
                        headers: request.headers
                    });

                    if (!res.result.error) {
                        return {
                            status: 'ok',
                            data: res.result
                        };
                    }
                    if (res.result.statusCode === 404) {
                        return {
                            status: 'error',
                            code: 'chart-not-found',
                            message: 'Chart not found'
                        };
                    }
                    if (res.result.message === 'Insufficient scope') {
                        return boomErrorWithData(Boom.forbidden('Insufficient scope'), {
                            code: 'access-denied'
                        });
                    }
                    // wrap generic errors
                    return boomErrorWithData(
                        new Boom.Boom(res.result.message, {
                            statusCode: res.result.statusCode
                        }),
                        res.result
                    );
                } catch (ex) {
                    server.logger.warn(ex);
                    return boomErrorWithData(Boom.badGateway('unexpected error'), {
                        status: 'error',
                        code: 'unknown_error',
                        message: 'Unknown error'
                    });
                }
            }
        });
        server.route({
            method: 'GET',
            path: '/{id}/data',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request, h) {
                try {
                    const res = await request.server.inject({
                        method: 'GET',
                        url: `/v3/charts/${request.params.id}/data`,
                        auth: request.auth,
                        headers: request.headers
                    });

                    if (!res.result.error) {
                        return h.response(res.result).type('text/csv');
                    }

                    if (res.result.statusCode === 404) {
                        return {
                            status: 'error',
                            code: 'chart-not-found',
                            message: 'Chart not found'
                        };
                    }
                    if (res.result.message === 'Insufficient scope') {
                        return boomErrorWithData(Boom.forbidden('Insufficient scope'), {
                            code: 'access-denied'
                        });
                    }
                    if (res.result.message === 'Forbidden') {
                        return {
                            status: 'error',
                            code: 'access-denied',
                            message: 'Forbidden'
                        };
                    }
                    // wrap generic errors
                    return boomErrorWithData(
                        new Boom.Boom(res.result.message, {
                            statusCode: res.result.statusCode
                        }),
                        res.result
                    );
                } catch (ex) {
                    server.logger.warn(ex);
                    return boomErrorWithData(Boom.badGateway('unexpected error'), {
                        status: 'error',
                        code: 'unknown_error',
                        message: 'Unknown error'
                    });
                }
            }
        });
        server.route({
            method: 'PUT',
            path: '/{id}/data',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request, h) {
                try {
                    const res = await request.server.inject({
                        method: 'PUT',
                        url: `/v3/charts/${request.params.id}/data`,
                        auth: request.auth,
                        headers: request.headers,
                        payload: request.payload
                    });

                    if (res.statusCode === 204) {
                        return h.response().code(200);
                    }
                    if (res.statusCode === 404) {
                        return {
                            status: 'error',
                            code: 'no-such-chart',
                            message: 'Chart not found'
                        };
                    }
                    if (res.result.message === 'Insufficient scope') {
                        return boomErrorWithData(Boom.forbidden('Insufficient scope'), {
                            code: 'access-denied'
                        });
                    }
                    if (res.result.message === 'Forbidden') {
                        return {
                            status: 'error',
                            code: 'access-denied',
                            message: 'Forbidden'
                        };
                    }
                    // wrap generic errors
                    return boomErrorWithData(
                        new Boom.Boom(res.result.message, {
                            statusCode: res.result.statusCode
                        }),
                        res.result
                    );
                } catch (ex) {
                    server.logger.warn(ex);
                    return boomErrorWithData(Boom.badGateway('unexpected error'), {
                        status: 'error',
                        code: 'unknown_error',
                        message: 'Unknown error'
                    });
                }
            }
        });

        server.route({
            method: 'PUT',
            path: '/{id}',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                const payload = request.payload;

                const oldPHPDefaultMetadata = {
                    data: {
                        transpose: false,
                        'vertical-header': true,
                        'horizontal-header': true
                    },
                    visualize: {
                        'highlighted-series': {},
                        'highlighted-values': {}
                    },
                    describe: {
                        'source-name': '',
                        'source-url': '',
                        'number-format': '-',
                        'number-divisor': 0,
                        'number-append': '',
                        'number-prepend': '',
                        intro: '',
                        byline: ''
                    },
                    publish: {
                        'embed-width': 600,
                        'embed-height': 400
                    },
                    annotate: {
                        notes: ''
                    }
                };

                // ignore protected keys
                [
                    'CreatedAt',
                    'AuthorId',
                    'Deleted',
                    'DeletedAt',
                    'InFolder',
                    'OrganizationId'
                ].forEach(key => {
                    delete payload[key];
                });

                try {
                    const res = await request.server.inject({
                        method: 'PUT',
                        url: `/v3/charts/${request.params.id}`,
                        auth: request.auth,
                        headers: { ...request.headers, 'Content-Type': 'application/json' },
                        payload
                    });

                    if (!res.result.error) {
                        res.result.metadata = assign(res.result.metadata, oldPHPDefaultMetadata);
                        return {
                            status: 'ok',
                            data: res.result
                        };
                    }

                    if (res.result.statusCode === 404) {
                        return {
                            status: 'error',
                            code: 'no-such-chart',
                            message: 'Chart not found'
                        };
                    }
                    if (res.result.statusCode === 401) {
                        return {
                            status: 'error',
                            code: 'access-denied',
                            message: 'Access denied'
                        };
                    }
                    if (res.result.message === 'Insufficient scope') {
                        return boomErrorWithData(Boom.forbidden('Insufficient scope'), {
                            code: 'access-denied'
                        });
                    }
                    // wrap generic errors
                    return boomErrorWithData(
                        new Boom.Boom(res.result.message, {
                            statusCode: res.result.statusCode
                        }),
                        res.result
                    );
                } catch (ex) {
                    server.logger.warn(ex);
                    return boomErrorWithData(Boom.badGateway('unexpected error'), {
                        status: 'error',
                        code: 'unknown_error',
                        message: 'Unknown error'
                    });
                }
            }
        });

        server.route({
            method: 'DELETE',
            path: '/{id}',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                try {
                    const res = await request.server.inject({
                        method: 'DELETE',
                        url: `/v3/charts/${request.params.id}`,
                        auth: request.auth,
                        headers: { ...request.headers }
                    });

                    if (res.result === null) {
                        return {
                            status: 'ok',
                            data: ''
                        };
                    }

                    if (res.result.statusCode === 404) {
                        return {
                            status: 'error',
                            code: 'no-such-chart',
                            message: 'Chart not found'
                        };
                    }
                    if (res.result.message === 'Insufficient scope') {
                        return boomErrorWithData(Boom.forbidden('Insufficient scope'), {
                            code: 'access-denied'
                        });
                    }
                    if (res.result.statusCode === 403) {
                        return {
                            status: 'error',
                            code: 'access-denied',
                            message: 'Access denied'
                        };
                    }
                    // wrap generic errors
                    return boomErrorWithData(
                        new Boom.Boom(res.result.message, {
                            statusCode: res.result.statusCode
                        }),
                        res.result
                    );
                } catch (ex) {
                    server.logger.warn(ex);
                    return boomErrorWithData(Boom.badGateway('unexpected error'), {
                        status: 'error',
                        code: 'unknown_error',
                        message: 'Unknown error'
                    });
                }
            }
        });
    }
};

function boomErrorWithData(boom, data) {
    boom.output.payload = {
        ...boom.output.payload,
        status: 'error',
        ...data
    };
    return boom;
}
