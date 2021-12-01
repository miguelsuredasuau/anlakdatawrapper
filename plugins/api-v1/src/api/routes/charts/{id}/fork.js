const Boom = require('@hapi/boom');

module.exports = {
    name: 'api-v1/charts/:id/fork',
    register: async server => {
        server.route({
            method: 'POST',
            path: '/{id}/fork',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                try {
                    const res = await request.server.inject({
                        method: 'POST',
                        url: `/v3/charts/${request.params.id}/fork`,
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
                            code: 'not-allowed',
                            message: 'You can not re-fork a forked chart.'
                        };
                    }
                    if (res.result.message === 'Insufficient scope') {
                        return boomErrorWithData(Boom.forbidden('Insufficient scope'), {
                            code: 'access-denied'
                        });
                    }
                    if (res.result.statusCode === 401) {
                        return {
                            status: 'error',
                            code: 'not-allowed',
                            message: 'You can not re-fork a forked chart.'
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
