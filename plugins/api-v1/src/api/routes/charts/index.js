const Boom = require('@hapi/boom');

module.exports = {
    name: 'api-v1/charts',
    register: async server => {
        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request, h) {
                try {
                    const { query } = request;

                    const queryParams = new URLSearchParams({
                        limit: '200',
                        offset: query.offset || '0'
                    });

                    switch (query.order) {
                        case 'title':
                            queryParams.append('orderBy', 'title');
                            queryParams.append('order', 'ASC');
                            break;
                        case 'status':
                            queryParams.append('orderBy', 'lastEditStep');
                            queryParams.append('order', 'DESC');
                            break;
                        case 'created_at':
                            queryParams.append('orderBy', 'createdAt');
                            queryParams.append('order', 'DESC');
                            break;
                        case 'published_at':
                            queryParams.append('orderBy', 'publishedAt');
                            queryParams.append('order', 'DESC');
                            break;
                    }

                    if (query.filter) {
                        const filters = query.filter.split('|');
                        filters.forEach(filter => {
                            if (filter === 'status:published') {
                                queryParams.append('minLastEditStep', '4');
                                return;
                            }
                            const [key, value] = filter.split(':');
                            if (key === 'q') {
                                queryParams.append('search', value);
                                return;
                            }
                            if (key === 'folder') {
                                queryParams.append('folderId', value);
                            }
                        });
                    }

                    if (query.expand) {
                        queryParams.append('expand', 'true');
                    }

                    const res = await request.server.inject({
                        method: 'GET',
                        url: `/v3/charts?${queryParams}`,
                        auth: request.auth,
                        headers: request.headers
                    });

                    if (res.result.message === 'Insufficient scope') {
                        const error = Boom.forbidden('Insufficient scope');
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'access-denied';
                        return error;
                    }

                    return {
                        status: 'ok',
                        data: res.result.list
                    };
                } catch (ex) {
                    server.logger.warn(ex);
                    return h
                        .response({
                            status: 'error',
                            code: 'unknown_error',
                            message: 'Unknown error'
                        })
                        .code(502);
                }
            }
        });

        server.route({
            method: 'POST',
            path: '/',
            options: {
                auth: {
                    mode: 'required'
                }
            },
            async handler(request, h) {
                try {
                    const res = await request.server.inject({
                        method: 'POST',
                        url: `/v3/charts`,
                        auth: request.auth,
                        headers: request.headers
                    });

                    if (res.result.message === 'Insufficient scope') {
                        const error = Boom.forbidden('Insufficient scope');
                        error.output.payload.status = 'error';
                        error.output.payload.code = 'access-denied';
                        return error;
                    }

                    return {
                        status: 'ok',
                        data: [res.result]
                    };
                } catch (ex) {
                    server.logger.warn(ex);
                    return h
                        .response({
                            status: 'error',
                            code: 'unknown_error',
                            message: 'Unknown error'
                        })
                        .code(502);
                }
            }
        });

        server.register(require('./{id}'));
        server.register(require('./{id}/data'));
        server.register(require('./{id}/fork'));
        server.register(require('./{id}/copy'));
        server.register(require('./{id}/publish'));
    }
};
