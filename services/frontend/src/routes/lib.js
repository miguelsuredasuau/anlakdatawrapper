const Boom = require('@hapi/boom');
const Joi = require('joi');
const chartCore = require('@datawrapper/chart-core');
const fs = require('fs-extra');
const path = require('path');
const { allLocalizationScopes } = require('@datawrapper/service-utils');

const ALLOWED_EXTS = [
    'css',
    'eot',
    'gif',
    'html',
    'ico',
    'jpeg',
    'jpg',
    'js',
    'json',
    'less',
    'otf',
    'png',
    'svg',
    'ttf',
    'webp',
    'woff',
    'woff2'
];
if (process.env.DW_DEV_MODE) {
    ALLOWED_EXTS.push('map');
}

// This list of allowed extensions should match the config of the nginx location that serves static files.
const FILE_SCHEMA = Joi.string()
    .required()
    .pattern(new RegExp(`\\.(${ALLOWED_EXTS.join('|')})$`));

module.exports = {
    name: 'routes/lib',
    version: '1.0.0',
    register: async server => {
        server.route([
            {
                path: '/chart-core/{file*}',
                method: 'GET',
                config: {
                    auth: false,
                    validate: {
                        params: Joi.object({
                            file: FILE_SCHEMA
                        })
                    }
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
                    auth: false,
                    validate: {
                        params: Joi.object({
                            file: FILE_SCHEMA
                        })
                    }
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
                    auth: false,
                    validate: {
                        params: Joi.object({
                            file: FILE_SCHEMA
                        })
                    }
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
                    auth: false,
                    validate: {
                        params: Joi.object({
                            file: FILE_SCHEMA
                        })
                    }
                },
                handler: {
                    directory: {
                        path: path.dirname(require.resolve('codemirror/package.json'))
                    }
                }
            },
            {
                path: '/icons/{file*}',
                method: 'GET',
                config: {
                    auth: false,
                    validate: {
                        params: Joi.object({
                            file: FILE_SCHEMA
                        })
                    }
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
                    auth: false,
                    validate: {
                        params: Joi.object({
                            file: FILE_SCHEMA
                        })
                    }
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
                            file: FILE_SCHEMA
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
                    return allLocalizationScopes(lang || 'en-US');
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
            }
        ]);
    }
};
