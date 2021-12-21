import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import multi from '@rollup/plugin-multi-entry';
import svelte from 'rollup-plugin-svelte';
import json from 'rollup-plugin-json';
import { join } from 'path';
import alias from '@rollup/plugin-alias';
import sveltePreprocess from 'svelte-preprocess';

export default {
    input: {
        include: ['src/**/*.test.*js'],
        exclude: ['src/views/_plugins/**']
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
                _partials: join(__dirname, 'src/views/_partials')
            }
        }),
        svelte({
            compilerOptions: {
                dev: true,
                accessors: true
            },
            preprocess: sveltePreprocess(),
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
