// Custom loader for on-the-fly transpiling of Svelte files in unit tests
// TODO: Add source maps support

import { URL, pathToFileURL } from 'url';
import path from 'path';
import { compile } from 'svelte';
import sourceMapSupport from 'source-map-support';

const baseURL = pathToFileURL(`${process.cwd()}/`).href;

// Svelte2 components use .html as file extension:
const extensionsRegex = /\.html$/;

// Add sourcemap support for svelte files:
const sourcemaps = {};
sourceMapSupport.install({
    retrieveSourceMap: function(filename) {
        const map = sourcemaps[filename];
        return map ? { url: filename, map } : null;
    }
});

export function resolve(specifier, context, defaultResolve) {
    const { parentURL = baseURL } = context;

    // Node.js normally errors on unknown file extensions, so return a URL for
    // specifiers ending in the Svelte file extension.
    if (extensionsRegex.test(specifier)) {
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

export function transformSource(source, context, defaultTransformSource) {
    const { url } = context;
    const filename = new URL(url).pathname;

    if (extensionsRegex.test(url)) {
        const { js } = compile(source.toString('utf8'), {
            filename,

            // component name, useful for debugging
            name: path.basename(filename, '.html')
        });

        // Make the sourcemap available to be retrieved via source-map-support:
        sourcemaps[url] = js.map;

        // Pass compiled Svelte source to Node.js:
        return { source: js.code };
    }

    // Let Node.js handle all other sources:
    return defaultTransformSource(source, context, defaultTransformSource);
}
