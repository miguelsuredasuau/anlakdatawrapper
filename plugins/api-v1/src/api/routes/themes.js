const Boom = require('@hapi/boom');

module.exports = {
    name: 'api-v1/themes',
    register: async server => {
        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request) {
                try {
                    const isAdmin = server.methods.isAdmin(request);
                    const url = isAdmin ? '/v3/admin/themes' : '/v3/themes';
                    const res = await request.server.inject({
                        method: 'GET',
                        url,
                        auth: request.auth,
                        headers: request.headers
                    });

                    if (!res.result.error) {
                        return {
                            status: 'ok',
                            data: res.result.list
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
