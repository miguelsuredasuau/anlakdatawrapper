'use strict';

const alias = require('@rollup/plugin-alias');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const rollup = require('rollup');
const svelte = require('rollup-plugin-svelte');
const sveltePreprocess = require('svelte-preprocess');
const tempfile = require('tempfile');
const { default: resolve } = require('@rollup/plugin-node-resolve');
const { join } = require('path');
const { readFile, unlink } = require('fs-extra');
const { terser } = require('rollup-plugin-terser');

const production = process.env.NODE_ENV === 'production';
let server;

module.exports.init = function (_server) {
    server = _server;
};

module.exports.build = async function (page, ssr) {
    const bundle = await rollup.rollup(buildOptions(page, ssr));

    const { output } = await bundle.generate({
        sourcemap: true,
        format: ssr || page.endsWith('.element.svelte') ? 'iife' : 'amd',
        name: 'App',
        amd: {
            id: page.endsWith('.svelte') ? 'App' : null // page
        },
        file: 'public/build/bundle.js'
    });
    return { code: output[0].code, map: output[0].map };
};

module.exports.watch = async function (page, callback) {
    if (!production) {
        const tmpCsr = tempfile('.js');
        const tmpSsr = tempfile('.js');
        const watcher = rollup.watch([
            {
                ...buildOptions(page, false),
                output: {
                    sourcemap: true,
                    format: 'amd',
                    name: 'App',
                    amd: {
                        id: page.endsWith('.svelte') ? 'App' : null // page
                    },
                    file: tmpCsr
                }
            },
            {
                ...buildOptions(page, true),
                output: {
                    sourcemap: true,
                    format: 'iife',
                    name: 'App',
                    amd: {
                        id: page.endsWith('.svelte') ? 'App' : null // page
                    },
                    file: tmpSsr
                }
            }
        ]);
        watcher.on('event', async ({ code, error }) => {
            if (code === 'ERROR') {
                console.error(error);
                callback(error);
            } else if (code === 'END') {
                const [csr, ssr, csrMap, ssrMap] = await Promise.all([
                    readFile(tmpCsr, 'utf-8'),
                    readFile(tmpSsr, 'utf-8'),
                    readFile(`${tmpCsr}.map`, 'utf-8'),
                    readFile(`${tmpSsr}.map`, 'utf-8')
                ]);
                callback(null, { csr, ssr, csrMap, ssrMap });
                unlink(tmpCsr);
                unlink(tmpSsr);
                unlink(`${tmpCsr}.map`);
                unlink(`${tmpSsr}.map`);
            }
        });
    }
};

function buildOptions(page, ssr) {
    if (!server) throw new Error('need to initialize first');
    const viewComponents = server.methods.getViewComponents(page);
    return {
        input: join('src/utils/svelte-view/View.svelte'), // join('src/views', page),
        plugins: [
            replace({
                values: {
                    __view__: join('../../views', page),
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
                    _layout: join(__dirname, '../../views/_layout'),
                    _partials: join(__dirname, '../../views/_partials')
                }
            }),
            svelte({
                compilerOptions: {
                    dev: !production,
                    generate: ssr ? 'ssr' : 'csr',
                    hydratable: true,
                    accessors: true,
                    customElement: page.endsWith('.element.svelte')
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

function onwarn(warning, handler) {
    if (
        warning.code === 'CIRCULAR_DEPENDENCY' &&
        warning.importer.includes('node_modules/xmlbuilder')
    ) {
        return;
    }
    handler(warning);
}
