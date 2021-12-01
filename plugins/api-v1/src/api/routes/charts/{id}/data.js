const Boom = require('@hapi/boom');

module.exports = {
    name: 'api-v1/charts/:id/data',
    register: async server => {
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
        server.route({
            method: 'POST',
            path: '/{id}/data',
            options: {
                payload: {
                    maxBytes: 2 * 1024 * 1024,
                    output: 'stream',
                    parse: true,
                    allow: 'multipart/form-data',
                    multipart: true,
                    failAction: async function (request, h, err) {
                        if (err.message.includes('Invalid multipart payload format')) {
                            return h
                                .response({
                                    status: 'error',
                                    code: 'upload-error',
                                    message: 'No files were uploaded.'
                                })
                                .code(200)
                                .takeover();
                        }
                        if (
                            err.message.includes(
                                'Payload content length greater than maximum allowed'
                            )
                        ) {
                            return h
                                .response({
                                    status: 'error',
                                    code: 'upload-error',
                                    message: 'File is too large'
                                })
                                .code(200)
                                .takeover();
                        }
                        return boomErrorWithData(Boom.badRequest('unexpected error'), {
                            status: 'error',
                            code: 'unknown_error',
                            message: 'Unknown error'
                        });
                    }
                },
                auth: {
                    mode: 'required'
                }
            },
            async handler(request, h) {
                try {
                    const data = request.payload;
                    const ext = data.qqfile.hapi.filename.split('.').pop();
                    if (!ext.match(/(csv|txt|tsv)$/)) {
                        return {
                            status: 'error',
                            code: 'upload-error',
                            message:
                                'File has an invalid extension, it should be one of txt, csv, tsv.'
                        };
                    }
                    const payload = await streamToString(data.qqfile);
                    if (!payload.length) {
                        return {
                            status: 'error',
                            code: 'upload-error',
                            message: 'File is empty'
                        };
                    }
                    const res = await request.server.inject({
                        method: 'PUT',
                        url: `/v3/charts/${request.params.id}/data`,
                        auth: request.auth,
                        headers: {
                            'Content-Type': data.qqfile.hapi['content-type']
                        },
                        payload
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

function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
        stream.on('error', err => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}

function boomErrorWithData(boom, data) {
    boom.output.payload = {
        ...boom.output.payload,
        status: 'error',
        ...data
    };
    return boom;
}
