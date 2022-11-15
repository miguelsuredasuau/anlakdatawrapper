'use strict';

const { MemoryCache } = require('@datawrapper/service-utils');
const { JSDOM } = require('jsdom');
const context = require('./context');
const ejs = require('ejs');
const jsesc = require('jsesc');
const { join, relative } = require('path');
const { readFile } = require('fs').promises;

const baseViewDir = join(__dirname, '../../views');
const buildViewDir = join(__dirname, '../../../build/views');

const templateCache = new MemoryCache();

/**
 * Global window for dompurify, because we bundle it without jsdom to make the bundles smaller.
 */
global.window = new JSDOM('').window;

/**
 * Read a template file (e.g. base.ejs).
 *
 * @param {string} file - File path
 * @param {Object} opt - Options
 * @param {boolean} [opt.useCache=true] - Use an in-memory cache of the template content
 */
function getTemplate(file, { useCache = true }) {
    return templateCache.withCache(file, () => readFile(join(baseViewDir, file), 'utf-8'), {
        useCache
    });
}

/**
 * Loads a view SSR module from a file compiled by rollup.
 *
 * @param {string} page - View name; for example 'Create.svelte'
 */
function requireViewSSR(page) {
    return require(join(buildViewDir, page + '.ssr.js'));
}

/**
 * Invalidates module cache for passed view.
 *
 * @param {string} page - View name; for example 'Create.svelte'
 */
function invalidateViewSSR(page) {
    delete require.cache[require.resolve(join(buildViewDir, page + '.ssr.js'))];
}

/**
 * Watches the build/views dir for changes and then invalidates SSR cache and notifies browser.
 */
function watchViews(wsClients) {
    const chokidar = require('chokidar');
    const pathRegExp = RegExp(`^${buildViewDir}/(?<page>.+\\.svelte)(?<ssr>(\\.ssr)?)\\.js$`);
    chokidar.watch(buildViewDir).on('all', (event, path) => {
        if (event === 'change') {
            const m = pathRegExp.exec(path);
            if (m) {
                const page = m.groups['page'];
                const ssr = m.groups['ssr'];
                process.stdout.write(`${ssr ? 'SSR' : 'CSR'} view ${page} changed\n`);
                if (ssr) {
                    invalidateViewSSR(page);
                }
                wsClients.forEach(ws => ws.send(JSON.stringify({ page })));
            }
        }
    });
}

class SvelteView {
    constructor(server) {
        this.server = server;
    }
    compile(t, compileOpts) {
        const page = relative(baseViewDir, compileOpts.filename);

        return async ({
            stores = {},
            storeCached = {},
            storeHashes = {},
            props = {},
            htmlClass = '',
            csrRoot = '/lib/csr/',
            libRoot = '/lib/',
            vendorRoot = '/static/vendor/',
            analytics = {},
            disableMatomo = false
        } = {}) => {
            const DW_DEV_MODE = this.server.methods.isDevMode();
            const config = this.server.methods.config();
            const favicon = config.frontend.favicon || libRoot + 'static/img/favicon.ico';

            let app;
            try {
                app = requireViewSSR(page);
            } catch (e) {
                this.server.log(['sentry'], e);
                const template = await getTemplate('error.ejs', { useCache: !DW_DEV_MODE });
                const output = ejs.render(template, {
                    FAVICON: favicon,
                    TITLE: 'Template error',
                    HEADING: 'Template error',
                    BODY: DW_DEV_MODE ? `<p>${e.message}</p>` : ''
                });
                return output;
            }

            for (const key in stores) {
                // resolve store values in case they are async
                stores[key] = await Promise.resolve(stores[key]);
            }
            props.stores = stores;

            props.csrRoot = csrRoot;
            props.libRoot = libRoot;
            props.vendorRoot = vendorRoot;

            const { css, html, head } = app.render(props);

            // remove stores that we already have in client-side cache
            Object.keys(storeCached).forEach(key => {
                props.stores[key] = {};
            });

            const template = await getTemplate('base.ejs', { useCache: !DW_DEV_MODE });
            const { user } = stores;
            const output = ejs.render(template, {
                HTML_CLASS: htmlClass,
                CSR_ROOT: csrRoot,
                LIB_ROOT: libRoot,
                VENDOR_ROOT: vendorRoot,
                ANALYTICS: {
                    uid: user.isGuest ? 'guest' : user.id,
                    ...analytics
                },
                SSR_HEAD: head,
                SSR_CSS: css.code,
                NODE_ENV: process.env.NODE_ENV,
                SSR_HTML: html,
                GITHEAD: this.server.app.GITHEAD,
                PAGE: page,
                PAGE_PROPS: jsesc(JSON.stringify(props), {
                    isScriptContext: true,
                    json: true,
                    wrap: true
                }),
                DW_DEV_MODE,
                STORE_HASHES: jsesc(JSON.stringify(storeHashes), {
                    isScriptContext: true,
                    json: true,
                    wrap: true
                }),
                DW_DOMAIN: config.api.domain,
                MATOMO: config.frontend.matomo && !disableMatomo ? config.frontend.matomo : null,
                SENTRY: (config.frontend.sentry && config.frontend.sentry.clientSide) || null,
                FAVICON: favicon,
                CORE_BEFORE_HEAD: await this.server.methods.getCustomHTML('core/beforeHead', {}),
                CORE_AFTER_HEAD: await this.server.methods.getCustomHTML('core/afterHead', {}),
                CORE_BEFORE_BODY: await this.server.methods.getCustomHTML('core/beforeBody', {}),
                CORE_AFTER_BODY: await this.server.methods.getCustomHTML('core/afterBody', {})
            });
            return output;
        };
    }
    context(request) {
        return context(request);
    }
}

module.exports = {
    name: 'utils/svelte-view/index',
    version: '1.0.0',
    async register(server) {
        server.app.SvelteView = new SvelteView(server);

        if (server.methods.isDevMode()) {
            const wsClients = new Set();

            watchViews(wsClients);

            const HAPIWebSocket = require('hapi-plugin-websocket');
            await server.register(HAPIWebSocket);

            server.route({
                method: 'POST',
                path: '/ws',
                config: {
                    plugins: {
                        websocket: {
                            initially: true,
                            only: true,
                            connect({ ws }) {
                                server.logger.info('new websocket client connected\n');
                                wsClients.add(ws);
                            },
                            disconnect({ ws }) {
                                server.logger.info('websocket client disconnected\n');
                                wsClients.delete(ws);
                            }
                        }
                    }
                },
                handler: () => {
                    return {};
                }
            });
        }
    }
};
