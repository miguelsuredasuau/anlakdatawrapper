const path = require('path');
const chartCore = require('@datawrapper/chart-core');
const Boom = require('@hapi/boom');
const { allScopes } = require('@datawrapper/service-utils/l10n');

module.exports = {
    name: 'routes/lib',
    version: '1.0.0',
    register: async server => {
        server.route([
            {
                path: '/chart-core/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                handler: {
                    directory: {
                        path: chartCore.path.dist
                    }
                }
            },
            {
                path: '/polyfills/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                handler: {
                    directory: {
                        path: path.resolve(
                            path.dirname(require.resolve('@datawrapper/polyfills/package.json')),
                            'polyfills'
                        )
                    }
                }
            },
            {
                path: '/requirejs/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                handler: {
                    directory: {
                        path: path.dirname(require.resolve('requirejs/package.json'))
                    }
                }
            },
            {
                path: '/icons/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                handler: {
                    directory: {
                        path: path.resolve(
                            path.dirname(require.resolve('@datawrapper/icons/package.json')),
                            'build'
                        )
                    }
                }
            },
            {
                path: '/static/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                handler: {
                    directory: {
                        path: 'static'
                    }
                }
            },
            {
                path: '/stores/messages.json',
                method: 'GET',
                async handler(request) {
                    const { auth } = request;
                    const lang = server.methods.getUserLanguage(auth);
                    return allScopes(lang || 'en-US');
                }
            },
            {
                path: '/api-status',
                method: 'GET',
                async handler(request) {
                    const api = server.methods.createAPI(request);
                    try {
                        await api('');
                        return { status: 'ok' };
                    } catch (err) {
                        return Boom.serverUnavailable('api responding with ' + err);
                    }
                }
            },
            {
                path: '/csr/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                async handler(request, h) {
                    const { file } = request.params;
                    const { anonymous } = request.query;
                    const isJS = file.endsWith('.js');
                    const isSvelte = file.includes('.svelte.js');
                    const isJSMap = file.endsWith('.js.map');
                    const page = isSvelte
                        ? file.replace(/\.svelte\.js(\.map)?/, '.svelte')
                        : isJS
                        ? file
                        : `${file}.js`;
                    // check that view is inside /src/views
                    const pathViews = path.resolve(__dirname, '../views');
                    const relPath = path.relative(pathViews, path.resolve(pathViews, page));
                    if (relPath.startsWith('..')) {
                        return Boom.forbidden();
                    }
                    const view = await server.methods.getView(page);
                    const { csr, csrMap, error } = view;
                    if (error) {
                        return Boom.notImplemented(error.message);
                    }
                    const code = isJSMap
                        ? csrMap
                        : csr.replace(
                              /\/\/# sourceMappingURL=.*\.js\.map/,
                              `//# sourceMappingURL=/lib/csr/${page}.js.map`
                          );
                    return h
                        .response(
                            anonymous
                                ? code
                                      .replace('define("App",', 'define(')
                                      .replace("define('App',", 'define(')
                                : code
                        )
                        .header('Content-Type', 'application/javascript');
                }
            }
        ]);
    }
};
