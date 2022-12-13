import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import multi from '@rollup/plugin-multi-entry';
import svelte from 'rollup-plugin-svelte';
import json from '@rollup/plugin-json';
import { join } from 'path';
import alias from '@rollup/plugin-alias';
import sveltePreprocess from 'svelte-preprocess';

export default {
    input: {
        include: [process.env.TEST ? `src/${process.env.TEST}` : 'src/**/*.test.*js'],
        exclude: [
            'src/views/_plugins/**',
            'src/routes/**/*.test.*js',
            'src/svelte2/node_modules/**',
            'src/node_modules/node-fetch/**'
        ]
    },
    output: {
        sourcemap: true,
        format: 'cjs',
        name: 'tests',
        file: 'build/bundle-tests.js'
    },
    plugins: [
        multi(),
        json(),
        alias({
            entries: {
                _layout: join(__dirname, 'src/views/_layout'),
                _partials: join(__dirname, 'src/views/_partials'),
                '@datawrapper/shared/decodeHtml': '@datawrapper/shared/decodeHtml.ssr',
                '@datawrapper/shared/httpReq': '@datawrapper/shared/httpReq.ssr',
                // Bundle dompurify without jsdom to decrease bundle size. Then load jsdom
                // in svelte-view/index.js.
                'isomorphic-dompurify': 'dompurify'
            }
        }),
        svelte({
            compilerOptions: {
                dev: true,
                accessors: true
            },
            preprocess: sveltePreprocess({
                scss: {
                    prependData: `@import 'src/styles/export.scss';`
                }
            }),
            emitCss: false
        }),
        resolve({
            only: [/^svelte-/]
        }),
        commonjs()
    ],
    onwarn(warning, warn) {
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        warn(warning);
    }
};
