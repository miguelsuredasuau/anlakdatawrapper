module.exports = {
    name: 'api-v1/plugins/basemaps',
    register: async server => {
        // GET /plugin/basemaps
        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: false
            },
            handler: async request => {
                const res = await request.server.inject({
                    method: 'GET',
                    url: '/v3/basemaps',
                    headers: request.headers
                });

                if (res.statusCode === 200) {
                    return {
                        status: 'ok',
                        data: res.result
                    };
                } else {
                    return {
                        status: 'error',
                        error: res.result
                    };
                }
            }
        });
        // GET /plugin/basemaps/{id}/{key}
        server.route({
            method: 'GET',
            path: '/{id}/{key}',
            options: {
                auth: false
            },
            handler: async request => {
                const { params } = request;
                const res = await request.server.inject({
                    method: 'GET',
                    url: `/v3/basemaps/${params.id}/${params.key}`,
                    headers: request.headers
                });

                if (res.statusCode === 200) {
                    return {
                        status: 'ok',
                        data: res.result
                    };
                } else {
                    return {
                        status: 'error',
                        error: res.result
                    };
                }
            }
        });
    }
};
