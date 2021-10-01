/* eslint-env node */
// Custom loader for on-the-fly transpiling of Svelte files in unit tests

import path from 'path';
import sourceMapSupport from 'source-map-support';
import sveltePreprocess from 'svelte-preprocess';
import { URL, pathToFileURL } from 'url';
import { compile, preprocess } from 'svelte/compiler';

const baseURL = pathToFileURL(`${process.cwd()}/`).href;

// Our components use .svelte as file extension:
const extensionsRegex = /\.svelte$/;

// Add sourcemap support for svelte files:
const sourcemaps = {};
sourceMapSupport.install({
    retrieveSourceMap: function (filename) {
        const map = sourcemaps[filename];
        return map ? { url: filename, map } : null;
    }
});

export function resolve(specifier, context, defaultResolve) {
    const { parentURL = baseURL } = context;

    // Node.js normally errors on unknown file extensions, so return a URL for
    // specifiers ending in the Svelte file extension.
    if (extensionsRegex.test(specifier) && specifier.startsWith('.')) {
        return { url: new URL(specifier, parentURL).href };
    }

    // Let Node.js handle all other specifiers.
    return defaultResolve(specifier, context, defaultResolve);
}

export function getFormat(url, context, defaultGetFormat) {
    // Now that we patched resolve to let Svelte URLs through, we need to
    // tell Node.js what format such URLs should be interpreted as. For the
    // purposes of this loader, all Svelte URLs are ES modules.
    if (extensionsRegex.test(url)) {
        return { format: 'module' };
    }

    // Let Node.js handle all other URLs.
    return defaultGetFormat(url, context, defaultGetFormat);
}

export async function transformSource(source, context, defaultTransformSource) {
    const { url } = context;
    const filename = new URL(url).pathname;

    // component name, useful for debugging
    const name = path.basename(filename, '.svelte');

    if (extensionsRegex.test(url)) {
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
        return { source: js.code };
    }

    // Let Node.js handle all other sources:
    return defaultTransformSource(source, context, defaultTransformSource);
}
