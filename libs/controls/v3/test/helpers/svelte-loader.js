/* eslint-env node */
// Custom loader for on-the-fly transpiling of Svelte files in unit tests

import { URL, pathToFileURL } from 'node:url';
import { basename } from 'node:path';
import { cwd } from 'node:process';
import { compile, preprocess } from 'svelte/compiler';
import sveltePreprocess from 'svelte-preprocess';
import sourceMapSupport from 'source-map-support';

const baseURL = pathToFileURL(`${cwd()}/`).href;

// Our components use .svelte as file extension:
const extensionsRegex = /\.svelte$/;
const lodashRegex = /^lodash\//;

// Add sourcemap support for svelte files:
const sourcemaps = {};
sourceMapSupport.install({
    retrieveSourceMap: function (filename) {
        const map = sourcemaps[filename];
        return map ? { url: filename, map } : null;
    }
});

export async function resolve(specifier, context, nextResolve) {
    // Resolve svelte files (*.html)
    if (extensionsRegex.test(specifier)) {
        const { parentURL = baseURL } = context;
        return {
            shortCircuit: true,
            url: new URL(specifier, parentURL).href
        };
    }

    if (lodashRegex.test(specifier) && !specifier.endsWith('.js')) {
        return nextResolve(specifier + '.js', context);
    }

    // Let Node.js handle all other specifiers.
    return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
    // Load and transpile svelte files (*.html)
    if (extensionsRegex.test(url)) {
        const format = 'module';
        const filename = new URL(url).pathname;
        const { source } = await nextLoad(url, { ...context, format });
        const name = basename(filename, '.svelte');

        const preprocessorResult = await preprocess(source.toString('utf8'), [sveltePreprocess()], {
            filename,
            name
        });

        let res;
        try {
            res = compile(preprocessorResult.code, {
                filename,
                name,
                accessors: true
            });
        } catch (e) {
            console.error(e.frame);
            throw e;
        }
        const { js } = res;

        // Make the sourcemap available to be retrieved via source-map-support:
        sourcemaps[url] = js.map;

        // Pass compiled Svelte source to Node.js:
        return {
            format,
            shortCircuit: true,
            source: js.code
        };
    }

    // Let Node.js handle all other specifiers.
    return nextLoad(url, context);
}
