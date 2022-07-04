const Joi = require('joi');

module.exports = {
    name: 'routes/signin',
    version: '1.0.0',
    register: async server => {
        const oauth = server.methods.config('general').oauth;
        const frontend = server.methods.config('frontend');
        const { preventGuestAccess } = frontend;
        const providers = (frontend.signinProviders || []).filter(
            provider => oauth && oauth.providers && oauth.providers[provider.url.substring(8)]
        );

        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: 'session',
                validate: {
                    query: Joi.object({
                        ref: Joi.string()
                            .optional()
                            .uri({ relativeOnly: true })
                            .pattern(/^(\/$|\/[^/])/), // prevent domains without implicit protocol
                        email: Joi.string().email().optional(), // allows prefilling of email field
                        passwordChanged: Joi.boolean().optional()
                    })
                }
            },
            async handler(request, h) {
                const { ref, email, passwordChanged } = request.query;

                if (request.auth.isAuthenticated && request.auth.artifacts?.role !== 'guest') {
                    return h.redirect(ref || '/');
                }

                return h.view('signin/Index.svelte', {
                    props: {
                        target: ref || '/',
                        providers,
                        email: email || '',
                        passwordChanged,
                        // @todo: read from config
                        noSignUp: !!preventGuestAccess,
                        signupWithoutPassword: false
                    }
                });
            }
        });

        server.methods.registerView('signin/Index.svelte');

        await server.register(require('./oauth'), {});
        await server.register(require('./sso'), {});
    }
};
