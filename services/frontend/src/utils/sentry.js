const { createHash } = require('crypto');
const set = require('lodash/set');
const get = require('lodash/get');

module.exports = {
    name: 'utils/sentry',
    version: '1.0.0',
    register: async (server, { commit }) => {
        const config = server.methods.config('frontend');

        await server.register({
            plugin: require('hapi-sentry'),
            options: {
                client: {
                    release: commit,
                    serverName: 'frontend',
                    ...config.sentry.client,
                    beforeSend(event) {
                        // make sure to scrub sensitive information before
                        // sending it to Sentry
                        [
                            'request.cookies.DW-SESSION',
                            'request.headers.cookie',
                            'user.session',
                            'user.token'
                        ].forEach(field => {
                            const value = get(event, field);
                            if (value) {
                                set(event, field, createHash('sha256').update(value).digest('hex'));
                            }
                        });
                        return event;
                    }
                },
                scope: config.sentry.scope,
                catchLogErrors: ['sentry']
            }
        });

        // Explicitly send 5xx errors to Sentry. Without this code, uncaught exceptions in routes
        // just show Svelte's error page (locally) or our custom error page (on prod) and no message
        // is logged or sent to Sentry. It is probably because hapi-sentry has a constraint for
        // channel 'error' but the uncaught exceptions arrive on channel 'internal' for some reason.
        server.events.on({ name: 'request', channels: 'internal' }, (request, event, tags) => {
            if (tags.error && event.error.isServer) {
                request.log(['sentry'], event.error);
            }
        });
    }
};
