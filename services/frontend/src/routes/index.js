module.exports = {
    name: 'routes',
    version: '1.0.0',
    register: async server => {
        await server.register(require('./signin'), {
            routes: {
                prefix: '/signin'
            }
        });

        await server.register(require('./dashboard.js'));

        await server.register(require('./admin.js'), {
            routes: {
                prefix: '/admin'
            }
        });

        await server.register(require('./archive.js'), {
            routes: {
                prefix: '/archive'
            }
        });

        await server.register(require('./preview'), {
            routes: {
                prefix: '/preview'
            }
        });

        await server.register(require('./lib.js'), {
            routes: {
                prefix: '/lib'
            }
        });

        if (server.methods.isDevMode()) {
            await server.register(require('./hello.js'), {
                routes: {
                    prefix: '/v2/hello'
                }
            });
        }

        await server.register(require('./edit.js'));

        await server.register(require('./datawrapper-invite/index.js'), {
            routes: {
                prefix: '/datawrapper-invite'
            }
        });

        await server.register(require('./create.js'), {
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

        await server.register(require('./web-components.js'), {
            routes: {
                prefix: '/v2/web-components'
            }
        });
    }
};
