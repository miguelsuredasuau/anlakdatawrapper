import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from 'rollup-plugin-babel';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
    {
        input: './src/main.js',
        output: {
            name: 'myapp',
            sourcemap: false,
            file: 'static/myapp.js',
            format: 'umd',
            amd: {
                id: 'myapp'
            }
        },
        plugins: [
            svelte({
                dev: !production,
                // we'll extract any component CSS out into
                // a separate file — better for performance
                css: css => {
                    css.write('static/myapp.css');
                },
                // this results in smaller CSS files
                cascade: false,
                store: true
            }),

            // If you have external dependencies installed from
            // npm, you'll most likely need these plugins. In
            // some cases you'll need additional configuration —
            // consult the documentation for details:
            // https://github.com/rollup/rollup-plugin-commonjs
            resolve(),
            json(),
            commonjs(),

            // If we're building for production (npm run build
            // instead of npm run dev), transpile and minify
            production &&
                babel({
                    exclude: [/node_modules\/(?!(@datawrapper|svelte)\/).*/],
                    extensions: ['.js', '.mjs', '.html'],
                    runtimeHelpers: true,
                    presets: [
                        [
                            '@babel/env',
                            {
                                targets: 'last 2 versions, not IE 10, not dead',
                                corejs: 3,
                                useBuiltIns: 'entry'
                            }
                        ]
                    ],
                    plugins: ['babel-plugin-transform-async-to-promises']
                }),

            production && terser()
        ]
    }
];
