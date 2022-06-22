'use strict';

const alias = require('@rollup/plugin-alias');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const replace = require('@rollup/plugin-replace');
const svelte = require('rollup-plugin-svelte');
const sveltePreprocess = require('svelte-preprocess');
const { default: resolve } = require('@rollup/plugin-node-resolve');
const { findConfigPath } = require('@datawrapper/service-utils/findConfig');
const { join } = require('path');
const { terser } = require('rollup-plugin-terser');

const configPath = findConfigPath();
const config = require(configPath);

const production = process.env.NODE_ENV === 'production';

function onwarn(warning, handler) {
    if (
        warning.code === 'CIRCULAR_DEPENDENCY' &&
        (warning.importer.includes('node_modules/xmlbuilder') ||
            warning.importer.includes('node_modules/d3'))
    ) {
        return;
    }
    handler(warning);
}

/**
 * Figure out which views and view components exist in all frontend routes and plugins.
 *
 * This function creates a fake Hapi server and then registers all frontend routes and plugins with
 * this fake server. The server doesn't do anything other than collect which views and view
 * components the routes and plugins tried to register:
 * - Views are collected by spying on `server.methods.registerView()`.
 * - View components are collected by spying on `server.methods.registerViewComponent()`.
 *
 * @returns {Object} res - Result
 * @returns {string[]} res.views - Array of view names
 * @returns {Object[]} res.viewComponents - Array of view component objects
 */
async function inspectApp() {
    const views = [];
    const viewComponents = [];

    const server = {
        app: {
            event: {},
            events: {
                emit() {}
            }
        },
        logger: {
            error() {},
            info() {},
            warn() {}
        },
        method() {},
        methods: new Proxy(
            {
                config(key) {
                    return key ? config[key] : config;
                },
                isDevMode() {
                    return true;
                },
                createAPI() {
                    return async function () {};
                },
                registerView(view) {
                    views.push(view);
                },
                registerViewComponent(viewComponent) {
                    viewComponents.push(viewComponent);
                }
            },
            {
                /**
                 * Allows calling a method of any name. The method will always return undefined.
                 */
                get(target, prop) {
                    if (target[prop]) {
                        return Reflect.get(...arguments);
                    }
                    return function () {};
                }
            }
        ),
        async register({ plugin, register, options }) {
            const registerFunc = plugin?.register || register;
            await registerFunc(server, options);
        },
        route() {}
    };

    const ORM = require('@datawrapper/orm');
    await ORM.create(config);

    await server.register(require('./src/routes/index.js'));
    await server.register(require('./src/utils/plugin-loader.js'));

    return { views, viewComponents };
}

function createInput(view, viewComponents, ssr) {
    return {
        external: [
            '/lib/codemirror/lib/codemirror',
            '/lib/codemirror/mode/javascript/javascript',
            '/lib/codemirror/mode/css/css',
            '/lib/codemirror/addon/search/searchcursor',
            '/lib/codemirror/addon/comment/comment',
            '/lib/codemirror/addon/fold/foldgutter',
            '/lib/codemirror/addon/fold/brace-fold',
            '/lib/codemirror/addon/lint/json-lint',
            '/lib/codemirror/addon/lint/lint',
            '/lib/codemirror/addon/search/search',
            '/lib/codemirror/addon/search/jump-to-line',
            '/lib/codemirror/addon/edit/matchbrackets',
            '/lib/codemirror/addon/edit/closebrackets',
            '/lib/codemirror/keymap/sublime',
            '/lib/jsonlint/jsonlint.js'
        ],
        input: join('src/utils/svelte-view/View.svelte'),
        output: {
            sourcemap: !production,
            format: ssr || view.endsWith('.element.svelte') ? 'iife' : 'amd',
            name: 'App',
            amd: {
                id: view.endsWith('.svelte') ? 'App' : null // view
            },
            file: `build/views/${view}.${ssr ? 'ssr' : 'csr'}.js`
        },
        plugins: [
            replace({
                values: {
                    __view__: join('../../views', view),
                    IMPORT_VIEW_COMPONENTS: viewComponents
                        .map(({ id, view }, i) => {
                            const viewVar = `view_component_${i}`;
                            const viewPath = join('../../views', view);
                            return [
                                `import ${viewVar} from '${viewPath}';`,
                                `viewComponents.set('${id}', ${viewVar});`
                            ].join('\n');
                        })
                        .join('\n')
                },
                preventAssignment: true
            }),
            alias({
                entries: {
                    _layout: join(__dirname, 'src/views/_layout'),
                    _partials: join(__dirname, 'src/views/_partials'),
                    _plugins: join(__dirname, 'src/views/_plugins'),
                    ...(ssr && {
                        '@datawrapper/shared/decodeHtml': '@datawrapper/shared/decodeHtml.ssr'
                    })
                }
            }),
            json(),
            svelte({
                compilerOptions: {
                    dev: !production,
                    generate: ssr ? 'ssr' : 'csr',
                    hydratable: true,
                    accessors: true,
                    customElement: view.endsWith('.element.svelte')
                },
                preprocess: sveltePreprocess(),
                emitCss: false
            }),
            resolve({
                browser: true,
                dedupe: ['svelte']
            }),
            commonjs(),
            production && terser()
        ],
        onwarn
    };
}

module.exports = inspectApp().then(({ views, viewComponents }) =>
    views
        .filter(view => {
            return !process.env.TARGET || view.startsWith(process.env.TARGET);
        })
        .flatMap(view =>
            [true, false].map(ssr =>
                createInput(
                    view,
                    viewComponents.filter(c => c.page === view),
                    ssr
                )
            )
        )
);
