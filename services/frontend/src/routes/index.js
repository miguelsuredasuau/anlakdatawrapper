module.exports = {
    name: 'routes',
    version: '1.0.0',
    register: async server => {
        await server.register(require('./signin'), {
            routes: {
                prefix: '/signin'
            }
        });

        await server.register(require('./dashboard'));

        await server.register(require('./archive.js'), {
            routes: {
                prefix: '/archive'
            }
        });

        await server.register(require('./preview/index.js'), {
            routes: {
                prefix: '/preview'
            }
        });

        await server.register(require('./lib'), {
            routes: {
                prefix: '/lib'
            }
        });

        if (server.methods.isDevMode()) {
            await server.register(require('./hello'), {
                routes: {
                    prefix: '/v2/hello'
                }
            });
        }

        await server.register(require('./create'), {
            routes: {
                prefix: '/create'
            }
        });

        await server.register(require('./account/invite.js'), {
            routes: {
                prefix: '/account/invite'
            }
        });

        await server.register(require('./account/activate.js'), {
            routes: {
                prefix: '/account/activate'
            }
        });

        await server.register(require('./account/reset-password.js'), {
            routes: {
                prefix: '/account/reset-password'
            }
        });

        server.methods.prepareView('Error.svelte');
    }
};
