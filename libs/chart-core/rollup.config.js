/* eslint-env node */

import path from 'path';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import svelte from 'rollup-plugin-svelte';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

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
        /* Svelte Visualization Component as web component */
        input: path.resolve(__dirname, 'web-component.js'),
        plugins: [
            /*
             * why are there two svelte calls here?
             *
             * svelte's customElement will make svelte components render as web components
             * or "custom elements". however, due to the way svelte is built, it will try
             * to make_every_single svelte component that is embedded its own custom element.
             * however chart-core and chart components assume to exist in the same context with the
             * same styles, DOM access etc. . so we need to make svelte render our 'entrypoint'
             * in "custom-element-mode" but all other embedded svelte components in "traditional"
             * mode - hence the two configurations with 'include' and 'exclude' rules.
             */

            svelte({
                customElement: true,
                include: /\.wc\.svelte$/
            }),
            svelte({
                customElement: false,
                exclude: /\.wc\.svelte$/,
                css: css => {
                    css.write(path.resolve(__dirname, 'dist', 'web-component.css'));
                }
            }),

            // for @emotion/css
            replace({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            resolve(),
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
        /* Client side Svelte Visualization Component */
        input: path.resolve(__dirname, 'main.mjs'),
        plugins: [
            svelte({ hydratable: true }),
            // for @emotion/css
            replace({
                values: {
                    'process.env.NODE_ENV': JSON.stringify('production')
                },
                preventAssignment: true
            }),
            resolve(),
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
            entryFileNames: 'main.js',
            ...output
        }
    },
    {
        /* Server side rendered Svelte Visualization Component */
        input: path.resolve(__dirname, 'lib/Visualization.svelte'),
        plugins: [
            svelte({ generate: 'ssr', hydratable: true }),
            // for @emotion/css
            replace({
                values: {
                    'process.env.NODE_ENV': JSON.stringify('production')
                },
                preventAssignment: true
            }),
            resolve(),
            commonjs(),
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
            resolve(),
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
            resolve(),
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
            resolve(),
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
            resolve({
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
