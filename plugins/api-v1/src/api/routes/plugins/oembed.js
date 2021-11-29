module.exports = {
    name: 'api-v1/plugins/oembed',
    register: async server => {
        const frontend = server.methods.config('frontend');

        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: false
            },
            handler: async request => {
                const res = await request.server.inject({
                    method: 'GET',
                    url: `/v3/oembed?${Object.keys(request.query)
                        .map(
                            key =>
                                encodeURIComponent(key) +
                                '=' +
                                encodeURIComponent(request.query[key])
                        )
                        .join('&')}`,
                    headers: request.headers
                });

                res.result.version = 1;
                res.result.provider_url = `${frontend.https ? 'https' : 'http'}://${
                    frontend.domain
                }`;

                return res.result;
            }
        });
    }
};
