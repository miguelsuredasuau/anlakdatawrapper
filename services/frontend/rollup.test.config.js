import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import multi from '@rollup/plugin-multi-entry';
import svelte from 'rollup-plugin-svelte';
import { join } from 'path';
import alias from '@rollup/plugin-alias';
import sveltePreprocess from 'svelte-preprocess';

export default {
    input: 'src/**/*.test.*js',
    output: {
        sourcemap: true,
        format: 'cjs',
        name: 'tests',
        file: 'build/bundle-tests.js'
    },
    plugins: [
        multi(),
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
