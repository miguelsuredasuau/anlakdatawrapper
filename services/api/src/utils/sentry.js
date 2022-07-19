const { createHash } = require('crypto');
const set = require('lodash/set');
const get = require('lodash/get');

module.exports = {
    name: 'utils/sentry',
    version: '1.0.0',
    register: async (server, { release }) => {
        const config = server.methods.config('api');
        const sentryConfig = config.sentry;
        if (!sentryConfig) {
            return;
        }
        server.logger.info(`Registering Sentry plugin: dsn=${sentryConfig.client.dsn}`);

        await server.register({
            plugin: require('hapi-sentry'),
            options: {
                client: {
                    release,
                    serverName: 'api',
                    ...sentryConfig.client,
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
                scope: sentryConfig.scope,
                catchLogErrors: ['sentry']
            }
        });
    }
};
