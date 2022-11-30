module.exports = {
    name: 'routes/admin',
    version: '1.0.0',
    register(server) {
        server.register(require('./teams'), {
            routes: {
                prefix: '/teams'
            }
        });

        server.register(require('./render-network'), {
            routes: {
                prefix: '/render-network'
            }
        });

        server.register(require('./themes'), {
            routes: {
                prefix: '/themes'
            }
        });

        /**
         * this route is only being used to support our legacy PHP
         * application, which needs access to the default feature flags
         * in order to compute team settings
         */
        server.route({
            method: 'GET',
            path: '/default-features',
            handler() {
                return server.methods.getFeatureFlags().map(flag => ({
                    id: flag.id,
                    default: flag.default
                }));
            }
        });
    }
};
