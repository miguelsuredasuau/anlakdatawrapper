const alias = require('@rollup/plugin-alias');
const commonjs = require('@rollup/plugin-commonjs');
const fastGlob = require('fast-glob');
const json = require('@rollup/plugin-json');
const replace = require('@rollup/plugin-replace');
const svelte = require('rollup-plugin-svelte');
const sveltePreprocess = require('svelte-preprocess');
const { default: resolve } = require('@rollup/plugin-node-resolve');
const { fetchAllPlugins, requireConfig } = require('@datawrapper/backend-utils');
const path = require('path');
const terser = require('@rollup/plugin-terser');

const sourceDir = 'src/views';
const outputDir = process.env.OUTPUT_DIR || 'build/views';

const sourceDirFullPath = path.resolve(path.join(__dirname, sourceDir));
const pluginsDirFullPath = path.resolve(path.join(__dirname, '../../plugins'));

const stripCode = require('rollup-plugin-strip-code');

const production = !process.env.ROLLUP_WATCH;
const modes = process.env.NODE_ENV === 'test' ? ['ssr'] : ['csr', 'ssr'];

const viewRegexp = /^(?<path>.+)\.view\.svelte/;

function onwarn(warning, handler) {
    if (
        warning.code === 'CIRCULAR_DEPENDENCY' &&
        (warning.importer.includes('node_modules/xmlbuilder') ||
            warning.importer.includes('node_modules/d3'))
    ) {
        return;
    }
    handler(warning);
}

function relativeIfSubpath(from, to) {
    if (to.startsWith(from + path.sep)) {
        return path.relative(from, to);
    }

    return null;
}

/**
 * Creates a rollup input object for passed views.
 *
 * @param {Object} opt - Options
 * @param {string[]} opt.views - View names
 * @param {string} opt.mode - Pass "csr" to compile the component for server-side rendering or "ssr" for server-side rendering
 * @param {Object} [opt.replacements={}] - Values to replace in all view files
 * @return {Object} Rollup input object
 */
function createViewInput({ views, mode, replacements = {}, pluginsInfo }) {
    const ext = mode === 'ssr' ? '.ssr.js' : '.js';
    return {
        input: views.map(view => path.join(sourceDir, view.replace(/\.svelte$/, '.view.svelte'))),
        external: ['Handsontable'],
        output: {
            dir: outputDir,
            sourcemap: true,
            format: mode === 'ssr' ? 'cjs' : 'amd',
            amd: {
                forceJsExtensionForImports: true
            },
            exports: 'default',
            /**
             * This function makes sure build/views has the same structure as src/views.
             *
             * Because by default rollup writes all output files in one flat directory.
             */
            entryFileNames({ facadeModuleId, isEntry }) {
                if (isEntry) {
                    const relativePath = relativeIfSubpath(sourceDirFullPath, facadeModuleId);
                    if (relativePath !== null) {
                        const viewMatch = relativePath.match(viewRegexp);
                        if (viewMatch) {
                            return viewMatch.groups['path'] + '.svelte' + ext;
                        }
                    } else {
                        const relativeToPluginsPath = relativeIfSubpath(
                            pluginsDirFullPath,
                            facadeModuleId
                        );
                        if (relativeToPluginsPath !== null) {
                            const pluginName = relativeToPluginsPath.split(path.sep)[0];
                            if (pluginsInfo[pluginName]) {
                                const viewsPath = pluginsInfo[pluginName].viewsPath;
                                const relativeToPluginPath = relativeIfSubpath(
                                    viewsPath,
                                    facadeModuleId
                                );
                                if (relativeToPluginPath !== null) {
                                    const viewMatch = relativeToPluginPath.match(viewRegexp);
                                    if (viewMatch) {
                                        return path.join(
                                            '_plugins',
                                            pluginName,
                                            viewMatch.groups['path'] + '.svelte' + ext
                                        );
                                    }
                                } else {
                                    console.warn(
                                        `Could not resolve facadeModuleId: ${facadeModuleId}`
                                    );
                                }
                            } else {
                                console.warn(
                                    `Could not resolve facadeModuleId: ${facadeModuleId}, ` +
                                        `because there is a symlink for plugin ${pluginName} but ` +
                                        "the plugin doesn't appear in config.js"
                                );
                            }
                        } else {
                            console.warn(`Could not resolve facadeModuleId: ${facadeModuleId}`);
                        }
                    }
                }
                return `[name]${ext}`;
            },
            chunkFileNames: `_chunks/${!production ? '[name]-' : ''}[hash]${ext}`
        },
        plugins: [
            replace({
                values: replacements,
                preventAssignment: true,
                delimiters: ['', '']
            }),
            ...(mode === 'ssr'
                ? [
                      stripCode({
                          start_comment: 'SSR_IGNORE_START',
                          end_comment: 'SSR_IGNORE_END'
                      })
                  ]
                : []),
            alias({
                entries: {
                    _layout: path.join(sourceDirFullPath, '_layout'),
                    _partials: path.join(sourceDirFullPath, '_partials'),
                    _plugins: path.join(sourceDirFullPath, '_plugins'),
                    _utils: path.join(sourceDirFullPath, '..', 'utils'),
                    ...(mode === 'ssr' && {
                        '@datawrapper/shared/decodeHtml.js':
                            '@datawrapper/shared/decodeHtml.ssr.js',
                        // Bundle dompurify without jsdom to decrease bundle size. Then load jsdom
                        // in svelte-view/index.js.
                        'isomorphic-dompurify': 'dompurify'
                    })
                }
            }),
            json(),
            svelte({
                compilerOptions: {
                    dev: !production,
                    generate: mode === 'ssr' ? 'ssr' : 'dom',
                    hydratable: true,
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
                browser: true,
                dedupe: ['svelte'],
                preferBuiltins: false
            }),
            commonjs(),
            production && mode !== 'ssr' && terser()
        ],
        onwarn
    };
}

/**
 * Creates a rollup input object for passed custom element.
 *
 * @param {Object} opt - Options
 * @param {string} opt.customElement - Custom element name
 * @param {string} opt.mode - Pass "csr" to compile the component for server-side rendering or "ssr" for server-side rendering
 * @return {Object} Rollup input object
 */
function createCustomElementInput({ customElement, mode }) {
    const ext = mode === 'ssr' ? '.ssr.js' : '.js';
    return {
        input: path.join(sourceDir, customElement),
        output: {
            file: path.join(outputDir, customElement + ext),
            sourcemap: mode !== 'ssr',
            format: 'iife',
            name: 'App'
        },
        plugins: [
            svelte({
                compilerOptions: {
                    dev: !production,
                    generate: mode === 'ssr' ? 'ssr' : 'dom',
                    hydratable: true,
                    accessors: true,
                    customElement: true
                },
                preprocess: sveltePreprocess(),
                emitCss: false
            }),
            resolve({
                browser: mode === 'csr',
                dedupe: ['svelte']
            }),
            commonjs({
                requireReturnsDefault(module) {
                    // Fix DOMPurify.addHook() not being defined due to `getAugmentedNamespace()`.
                    if (module.endsWith('/node_modules/dompurify/dist/purify.es.js')) {
                        return true; // Return the default export without checking if it actually exists.
                    }
                    return undefined;
                }
            }),
            production && mode !== 'ssr' && terser(),
            commonjs()
        ],
        onwarn
    };
}

async function main() {
    // Find all views by searching for *.view.svelte files.
    const views = (await fastGlob(path.join(sourceDir, '**/*.view.svelte')))
        .map(absolutePath =>
            path.relative(sourceDir, absolutePath).replace(/\.view\.svelte$/, '.svelte')
        )
        .filter(view => !process.env.TARGET || view.startsWith(process.env.TARGET));

    // Find all custom elements by searching for *.element.svelte files.
    const customElements = (await fastGlob(path.join(sourceDir, '**/*.element.svelte')))
        .map(absolutePath => path.relative(sourceDir, absolutePath))
        .filter(
            customElement => !process.env.TARGET || customElement.startsWith(process.env.TARGET)
        );

    // Find all view components by reading plugin.json files.
    const config = requireConfig();
    const pluginsInfo = await fetchAllPlugins(config);
    const viewComponents = Object.values(pluginsInfo).flatMap(
        ({ manifest }) => manifest?.viewComponents ?? []
    );

    // Inject view component import statements into view files.
    const viewComponentReplacements = Object.fromEntries(
        views.map(view => [
            `// ROLLUP IMPORT VIEW COMPONENTS ${view}`,
            viewComponents
                .filter(({ page }) => page === view)
                .map(({ id, view }, i) => {
                    const viewVar = `view_component_${i}`;
                    const viewPath = path.join('../../views', view);
                    return [
                        `import ${viewVar} from '${viewPath}';`,
                        `viewComponents.set('${id}', ${viewVar});`
                    ].join('\n');
                })
                .join('\n')
        ])
    );

    // Create rollup inputs.
    const inputs = [];
    for (const mode of modes) {
        // Create rollup inputs for views.
        if (views.length) {
            inputs.push(
                createViewInput({
                    views,
                    mode,
                    pluginsInfo,
                    replacements: viewComponentReplacements
                })
            );
        }
        // Create rollup inputs for custom elements.
        if (customElements.length) {
            for (const customElement of customElements) {
                inputs.push(
                    createCustomElementInput({
                        customElement,
                        mode
                    })
                );
            }
        }
    }
    return inputs;
}

module.exports = main().then();
