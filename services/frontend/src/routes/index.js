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

        await server.register(require('./admin'), {
            routes: {
                prefix: '/admin'
            }
        });

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

        await server.register(require('./edit'));

        await server.register(require('./datawrapper-invite/index.js'), {
            routes: {
                prefix: '/datawrapper-invite'
            }
        });

        await server.register(require('./create'), {
            routes: {
                prefix: '/create'
            }
        });

        await server.register(require('./account'), {
            routes: {
                prefix: '/account'
            }
        });

        await server.register(require('./team'), {
            routes: {
                prefix: '/team'
            }
        });

        server.methods.prepareView('Error.svelte');
        server.methods.prepareView('_partials/svelte2/Svelte2Wrapper.element.svelte');
    }
};
