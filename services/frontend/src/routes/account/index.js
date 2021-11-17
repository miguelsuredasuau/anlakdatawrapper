module.exports = {
    name: 'routes/account/index',
    version: '1.0.0',
    register: async server => {
        await server.register(require('./invite.js'), {
            routes: {
                prefix: '/invite'
            }
        });

        await server.register(require('./activate.js'), {
            routes: {
                prefix: '/activate'
            }
        });

        await server.register(require('./reset-password.js'), {
            routes: {
                prefix: '/reset-password'
            }
        });
    }
};
