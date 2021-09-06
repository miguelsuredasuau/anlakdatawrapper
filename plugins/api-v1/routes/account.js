const Joi = require('joi');

module.exports = {
    name: 'api-v1/account',
    register: async (server, options) => {
        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: { mode: 'try' }
            },
            handler: async (request, h) => {
                const guest = {
                    id: null,
                    email: "guest@datawrapper.de",
                    name: null,
                    website: null,
                    socialmedia: null,
                    isLoggedIn: false,
                    isGuest: true,
                    isActivated: true,
                    isAdmin: false
                };

                try {
                    const res = await request.server.inject({
                        method: 'GET',
                        url: `/v3/me`,
                        auth: request.auth,
                        headers: request.headers
                    });

                    if (res.statusCode >= 400) {
                        return { status: 'ok', data: { user: guest } };
                    }

                    const user = res.result;

                    return {
                        status: 'ok',
                        data: {
                            user: {
                                id: user.id,
                                email: user.email,
                                name: user.name || null,
                                website: user.website || null,
                                socialmedia: user.sm_profile || null,
                                isLoggedIn: true,
                                isGuest: false,
                                isActivated: user.role !== "pending",
                                isAdmin: user.role === "admin"
                            }
                        }
                    }
                } catch (ex) {
                    return { status: 'ok', data: { user: guest } };
                }
            }
        });

        server.route({
            method: 'GET',
            path: '/lang',
            options: {
                auth: { mode: 'try' }
            },
            handler: async (request, h) => {
                try {
                    const res = await request.server.inject({
                        method: 'GET',
                        url: `/v3/me`,
                        auth: request.auth,
                        headers: request.headers
                    });

                    if (res.statusCode < 400) {
                        return {
                            status: 'ok',
                            data: res.result.language.replace('-', '_')
                        };
                    } else {
                        return {
                            status: 'ok',
                            data: 'en_US'
                        }
                    }
                } catch (ex) {
                    return {
                        status: 'ok',
                        data: 'en_US'
                    }
                }
            }
        });

        server.route({
            method: 'PUT',
            path: '/lang',
            options: {
                auth: {
                    access: { scope: ['user:write'] }
                },
                validate: {
                    payload: Joi.object({
                        lang: Joi.string()
                            .required()
                            // todo: replace with config values once locales are moved to node
                            .valid('de-DE', 'en-US', 'it-IT', 'fr-FR', 'zh-CN', 'es-ES')
                            .description('The chosen language for the user.')
                    })
                }
            },
            handler: async (request, h) => {
                const { payload } = request;

                await request.server.inject({
                    method: 'PATCH',
                    url: `/v3/me`,
                    auth: request.auth,
                    headers: request.headers,
                    payload: {
                        language: payload.lang
                    }
                });

                return {
                    status: 'ok',
                    data: {}
                };
            }
        });
    }
};