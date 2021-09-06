const Joi = require('joi');

module.exports = {
    name: 'api-v1/plugins/login-tokens',
    register: async (server, options) => {
        // GET /plugin/login-tokens/{token}
        server.route({
            method: 'GET',
            path: '/{token}',
            options: {
                auth: false,
                validate: {
                    params: Joi.object({
                        token: Joi.string()
                            .required()
                            .description('A valid login token.')
                    })
                }
            },
            handler: (request, h) => {
                const { params, server } = request;
                const { api } = server.methods.config();

                return h.redirect(
                    `${api.https ? 'https' : 'http'}://${api.subdomain}.${
                        api.domain
                    }/v3/auth/login/${params.token}`
                );
            }
        });

        // POST /plugin/login-tokens
        server.route({
            method: 'POST',
            path: '/',
            handler: async (request, h) => {
                const res = await request.server.inject({
                    method: 'POST',
                    url: `/v3/auth/login-tokens`,
                    auth: request.auth,
                    headers: request.headers
                });

                if (res.statusCode < 400 && res.result.redirect_url) {
                    return {
                        status: 'ok',
                        data: {
                            redirect_url: res.result.redirect_url
                        }
                    };
                } else {
                    return {
                        status: 'error',
                        error: res.result
                    };
                }
            }
        });

        // POST /plugin/login-tokens/{chartId}/{step}
        server.route({
            method: 'POST',
            path: '/{chartId}/{step}',
            options: {
                validate: {
                    params: Joi.object({
                        chartId: Joi.string()
                            .length(5)
                            .required()
                            .description('A chart ID.'),
                        step: Joi.string()
                            .required()
                            .allow(
                                'basemap',
                                'data',
                                'upload',
                                'describe',
                                'visualize',
                                'publish',
                                'preview'
                            )
                            .description('A step in the chart editor.')
                    })
                }
            },
            handler: async (request, h) => {
                const { params } = request;

                const payload = {
                    chartId: params.chartId,
                    step: params.step
                };

                const res = await request.server.inject({
                    method: 'POST',
                    url: `/v3/auth/login-tokens`,
                    auth: request.auth,
                    headers: request.headers,
                    payload
                });

                if (res.statusCode < 400 && res.result.redirect_url) {
                    return {
                        status: 'ok',
                        data: {
                            redirect_url: res.result.redirect_url
                        }
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
