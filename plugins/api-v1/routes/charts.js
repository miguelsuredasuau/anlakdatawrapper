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
            async handler(request) {
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
                    return { status: 'error', code: 'unknown_error', message: 'Unknown error' };
                }
            }
        });

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
                    return { status: 'error', code: 'unknown_error', message: 'Unknown error' };
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
