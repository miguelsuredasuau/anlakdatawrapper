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
    }
};
