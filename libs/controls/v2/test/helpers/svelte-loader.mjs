/* eslint-env node */
// Custom loader for on-the-fly transpiling of Svelte files in unit tests

import { URL, pathToFileURL } from 'node:url';
import { basename } from 'node:path';
import { cwd } from 'node:process';
import { compile } from 'svelte';
import sourceMapSupport from 'source-map-support';

const baseURL = pathToFileURL(`${cwd()}/`).href;
// Svelte2 components use .html as file extension:
const extensionsRegex = /\.html$/;

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

    // Let Node.js handle all other specifiers.
    return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
    // Load and transpile svelte files (*.html)
    if (extensionsRegex.test(url)) {
        const format = 'module';
        const { source: rawSource } = await nextLoad(url, { ...context, format });
        const filename = new URL(url).pathname;
        const { js } = compile(rawSource.toString('utf8'), {
            filename,

            // component name, useful for debugging
            name: basename(filename, '.html')
        });

        // Make the sourcemap available to be retrieved via source-map-support:
        sourcemaps[url] = js.map;

        // Pass compiled Svelte source to Node.js:
        return {
            format: 'module',
            shortCircuit: true,
            source: js.code
        };
    }

    // Let Node.js handle all other specifiers.
    return nextLoad(url, context);
}
