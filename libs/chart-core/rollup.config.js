const alias = require('@rollup/plugin-alias');
const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const path = require('path');
const postcss = require('rollup-plugin-postcss');
const replace = require('@rollup/plugin-replace');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const svelte = require('rollup-plugin-svelte');
const { terser } = require('rollup-plugin-terser');
const sveltePreprocess = require('svelte-preprocess');

const NODE_BUILTINS = [
    'assert',
    'buffer',
    'child_process',
    'crypto',
    'events',
    'fs',
    'http',
    'https',
    'net',
    'os',
    'perf_hooks',
    'punycode',
    'punycode/', // Fixes missing global variable name `punycode/`.
    'stream',
    'string_decoder',
    'tls',
    'tty',
    'url',
    'util',
    'vm',
    'zlib',
    'path'
];

const production = !process.env.ROLLUP_WATCH;

const output = {
    name: 'chart',
    dir: path.resolve(__dirname, 'dist'),
    compact: true
};

const babelConfig = {
    exclude: [/node_modules\/(?!(@datawrapper|svelte)\/).*/],
    extensions: ['.js', '.mjs', '.svelte', '.cjs']
};

function onwarn(warning, warn) {
    if (warning.code === 'EVAL') return;
    if (warning.code === 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT') return;
    warn(warning);
}

module.exports = [
    {
        // Svelte Visualization Component as web component
        input: path.resolve(__dirname, 'web-component.js'),
        plugins: [
            // Why are there two svelte calls here?
            //
            // Svelte's customElement will make svelte components render as web components or
            // "custom elements". however, due to the way svelte is built, it will try to
            // make_every_single svelte component that is embedded its own custom element.  however
            // chart-core and chart components assume to exist in the same context with the same
            // styles, DOM access etc. . so we need to make svelte render our 'entrypoint' in
            // "custom-element-mode" but all other embedded svelte components in "traditional" mode
            // - hence the two configurations with 'include' and 'exclude' rules.
            svelte({
                compilerOptions: {
                    customElement: true
                },
                preprocess: sveltePreprocess({
                    scss: true
                }),
                include: /\.wc\.svelte$/
            }),
            svelte({
                compilerOptions: {
                    customElement: false
                },
                exclude: /\.wc\.svelte$/,
                emitCss: true,
                preprocess: sveltePreprocess({
                    scss: true
                })
            }),
            postcss({
                extract: true,
                sourceMap: true
            }),
            replace({
                values: {
                    'process.env.NODE_ENV': JSON.stringify('production') // for @emotion/css
                },
                preventAssignment: true
            }),
            nodeResolve({
                browser: true
            }),
            commonjs(),
            production &&
                babel({
                    ...babelConfig,
                    presets: [
                        [
                            '@babel/env',
                            // needs to at least not throw syntax errors in IE
                            { targets: ['> 1%'], corejs: 3, useBuiltIns: 'entry' }
                        ]
                    ],
                    plugins: ['babel-plugin-transform-async-to-promises']
                }),
            production && terser()
        ],
        onwarn,
        output: {
            format: 'iife',
            entryFileNames: 'web-component.js',
            ...output
        }
    },
    {
        // Client side Svelte Visualization Component
        input: path.resolve(__dirname, 'main.mjs'),
        plugins: [
            svelte({
                compilerOptions: {
                    hydratable: true
                },
                emitCss: false,
                preprocess: sveltePreprocess({
                    scss: true
                })
            }),
            replace({
                values: {
                    'process.env.NODE_ENV': JSON.stringify('production') // for @emotion/css
                },
                preventAssignment: true
            }),
            nodeResolve({
                browser: true
            }),
            commonjs(),
            production &&
                babel({
                    ...babelConfig,
                    presets: [['@babel/env', { targets: '> 1%', corejs: 3, useBuiltIns: 'entry' }]],
                    plugins: ['babel-plugin-transform-async-to-promises']
                }),
            production && terser()
        ],
        onwarn,
        output: {
            format: 'iife',
            sourcemap: true,
            entryFileNames: 'main.js',
            ...output
        }
    },
    {
        // Server side rendered Svelte Visualization Component
        input: path.resolve(__dirname, 'lib/Visualization.svelte'),
        plugins: [
            json(), // Required to load `node_modules/jsdom/package.json`.
            svelte({
                compilerOptions: {
                    generate: 'ssr',
                    hydratable: true
                },
                preprocess: sveltePreprocess({
                    scss: true
                }),
                emitCss: false
            }),
            replace({
                values: {
                    'process.env.NODE_ENV': JSON.stringify('production') // for @emotion/css
                },
                preventAssignment: true
            }),
            nodeResolve({
                preferBuiltins: true // Hides warning `preferring built-in module 'punycode/'` and `string_decoder`.
            }),
            commonjs({
                dynamicRequireTargets: [
                    'node_modules/jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js' // Fixes `Cannot find module './xhr-sync-worker.js'` in runtime.
                ],
                ignore: [
                    ...NODE_BUILTINS,
                    'canvas' // Canvas is an optional dependency of jsdom that we don't need.
                ]
            }),
            babel({
                ...babelConfig,
                presets: [['@babel/env', { targets: { node: true } }]]
            })
        ],
        onwarn,
        output: {
            format: 'umd',
            entryFileNames: 'Visualization_SSR.js',
            ...output
        }
    },
    {
        input: path.resolve(__dirname, 'load-polyfills.js'),
        plugins: [
            nodeResolve(),
            commonjs(),
            babel({
                ...babelConfig,
                presets: [['@babel/env', { targets: '> 1%', corejs: 3, useBuiltIns: 'entry' }]],
                plugins: ['babel-plugin-transform-async-to-promises']
            }),
            production && terser()
        ],
        onwarn,
        output: {
            format: 'iife',
            entryFileNames: 'load-polyfills.js',
            ...output
        }
    },
    {
        input: path.resolve(__dirname, 'lib/embed.js'),
        plugins: [
            nodeResolve(),
            commonjs(),
            babel({
                ...babelConfig,
                presets: [['@babel/env', { targets: '> 1%', corejs: 3, useBuiltIns: 'entry' }]],
                plugins: ['babel-plugin-transform-async-to-promises']
            }),
            production && terser()
        ],
        output: {
            name: 'embed',
            file: path.resolve(__dirname, 'dist/embed.js'),
            format: 'iife'
        }
    },
    {
        input: path.resolve(__dirname, 'lib/dw/index.mjs'),
        plugins: [
            nodeResolve({
                browser: true
            }),
            commonjs(),
            replace({
                values: {
                    __chartCoreVersion__: require('./package.json').version,
                    'process.env.NODE_ENV': JSON.stringify('production')
                },
                preventAssignment: true
            }),
            babel({
                ...babelConfig,
                presets: [['@babel/env', { targets: '> 1%', corejs: 3, useBuiltIns: 'entry' }]],
                plugins: ['babel-plugin-transform-async-to-promises']
            }),
            production && terser()
        ],
        onwarn,
        output: {
            sourcemap: true,
            file: path.resolve(__dirname, 'dist/dw-2.0.min.js'),
            format: 'iife'
        }
    },
    {
        input: path.resolve(__dirname, 'lib/dw/index.mjs'),
        plugins: [
            alias({
                entries: [
                    {
                        find: '@emotion/css/create-instance/dist/emotion-css-create-instance.cjs.js',
                        replacement: '@emotion/css/create-instance'
                    }
                ]
            }),
            nodeResolve({
                modulesOnly: true
            }),
            commonjs(),
            replace({
                values: {
                    __chartCoreVersion__: require('./package.json').version,
                    'process.env.NODE_ENV': JSON.stringify('production')
                },
                preventAssignment: true
            })
        ],
        onwarn,
        output: {
            sourcemap: true,
            file: path.resolve(__dirname, 'dist/dw-2.0.cjs.js'),
            format: 'cjs'
        }
    }
];
