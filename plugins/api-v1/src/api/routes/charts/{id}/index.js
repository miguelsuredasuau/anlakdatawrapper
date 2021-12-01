const Boom = require('@hapi/boom');

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
                        return boomErrorWithData(Boom.notFound('No chart with that id was found'), {
                            ...res.result,
                            code: 'chart-not-found'
                        });
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
