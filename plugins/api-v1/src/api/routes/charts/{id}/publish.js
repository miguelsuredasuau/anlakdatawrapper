const Boom = require('@hapi/boom');

module.exports = {
    name: 'api-v1/charts/:id/publish',
    register: async server => {
        server.route({
            method: 'POST',
            path: '/{id}/publish',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request, h) {
                try {
                    const res = await request.server.inject({
                        method: 'POST',
                        url: `/v3/charts/${request.params.id}/publish`,
                        auth: request.auth,
                        headers: request.headers
                    });

                    return h.response(res.result).code(res.statusCode);
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
