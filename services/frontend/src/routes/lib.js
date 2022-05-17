const path = require('path');
const fs = require('fs-extra');
const chartCore = require('@datawrapper/chart-core');
const Boom = require('@hapi/boom');
const Joi = require('joi');
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
                path: '/codemirror/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                handler: {
                    directory: {
                        path: path.dirname(require.resolve('codemirror/package.json'))
                    }
                }
            },
            {
                path: '/jsonlint/{file*}',
                method: 'GET',
                config: {
                    auth: false
                },
                handler: {
                    directory: {
                        path: path.dirname(require.resolve('jsonlint/web/jsonlint.js'))
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
                path: '/plugins/{plugin}/static/{file*}',
                method: 'GET',
                config: {
                    auth: false,
                    validate: {
                        params: Joi.object({
                            plugin: Joi.string()
                                .required()
                                // only allow access to configured plugins
                                .valid(...Object.keys(server.methods.config('plugins'))),
                            file: Joi.string().required()
                        })
                    }
                },
                async handler(request, h) {
                    const pluginPath = path.join('../../plugins');
                    const { plugin, file } = request.params;
                    const filename = path.join(pluginPath, plugin, 'static', file);
                    if (
                        path
                            .relative(path.join(pluginPath, plugin, 'static'), filename)
                            .startsWith('../')
                    ) {
                        // we're disabling the confine option below to be able
                        // to serve files outside 'services/frontend', so we manually
                        // need to confine filenames to the plugins static/ folder
                        throw Boom.forbidden();
                    }
                    try {
                        // check if file exists and if file is file
                        // we need to do this since h.file() throws an
                        // error when trying to access a folder "inside" an
                        // existing file, e.g. plugins/foo/exists.txt/xxx
                        const stats = await fs.stat(filename);
                        if (!stats.isFile()) throw Boom.notFound();
                    } catch (error) {
                        throw Boom.notFound();
                    }
                    return h.file(filename, { confine: false });
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
                    let view;
                    try {
                        view = await server.methods.getView(page);
                    } catch (e) {
                        return Boom.notFound();
                    }
                    const code = isJSMap
                        ? view.csrMap
                        : view.csr.replace(
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
