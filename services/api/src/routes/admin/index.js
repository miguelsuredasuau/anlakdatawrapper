module.exports = {
    name: 'routes/admin',
    version: '1.0.0',
    register(server) {
        server.register(require('./plugins'), {
            routes: {
                prefix: '/plugins'
            }
        });

        server.register(require('./teams'), {
            routes: {
                prefix: '/teams'
            }
        });

        server.register(require('./themes'), {
            routes: {
                prefix: '/themes'
            }
        });
    }
};
