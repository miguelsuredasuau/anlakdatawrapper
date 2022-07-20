'use strict';

const MemoryCache = require('@datawrapper/service-utils/MemoryCache');
const context = require('./context');
const ejs = require('ejs');
const jsesc = require('jsesc');
const { join, relative } = require('path');
const { readFile } = require('fs').promises;
const { readFileSync } = require('fs');

const baseViewDir = join(__dirname, '../../views');
const buildViewDir = join(__dirname, '../../../build/views');

const views = new Set();
const viewComponents = new Map();

const templateCache = new MemoryCache();
const viewCache = new MemoryCache();

/**
 * Registers a view with rollup.
 */
function registerView(page) {
    views.add(page);
}

/**
 * Registers a view component with rollup.
 */
function registerViewComponent({ id, page, view }) {
    viewComponents.set(id, { id, page, view });
}

function getTemplate(file, { useCache = true }) {
    return templateCache.withCache(file, () => readFile(join(baseViewDir, file), 'utf-8'), {
        useCache
    });
}

/**
 * Reads view files compiled by rollup.
 *
 * Used also by the '/libs' route to serve compiled views.
 */
function getView(page) {
    return viewCache.withCache(page, () => {
        try {
            const build = join(buildViewDir, page);
            const ssr = readFileSync(build + '.ssr.js', 'utf-8');
            const csr = readFileSync(build + '.csr.js', 'utf-8');
            const csrMap = readFileSync(build + '.csr.js.map', 'utf-8');
            const ssrFunc = new Function(ssr + ';return App');
            return { ssr, csr, csrMap, ssrFunc };
        } catch (e) {
            if (e.code === 'ENOENT') {
                let message = `Compiled view files for \`${page}\` were not found`;
                if (views.has(page)) {
                    message += ', but the view has been registered. ';
                    message += 'Have you run `npm run build` in `services/frontend`?';
                } else {
                    message += ' and the view has not been registered. ';
                    message += `Have you called \`server.methods.registerView('${page}')\` in your code?`;
                }
                throw new Error(message);
            }
            throw e;
        }
    });
}

function watchViews(wsClients) {
    const chokidar = require('chokidar');
    // watch build/views directory for changes
    chokidar.watch(buildViewDir).on('all', (event, filename) => {
        if (event === 'change' && filename.endsWith('.svelte.csr.js')) {
            const page = relative(buildViewDir, filename).replace('.csr.js', '');
            // Wait a bit more to make sure both csr/ssr have been compiled. Perhaps this isn't
            // necessary (if rollup always builds csr after ssr has been built).
            setTimeout(() => {
                // invalidate the view cache
                viewCache.drop(page);
                process.stdout.write(`Invalidated csr/ssr cache for ${page}\n`);
                // notify page
                wsClients.forEach(ws => ws.send(JSON.stringify({ page })));
            }, 300);
        }
    });
}

class SvelteView {
    constructor(server) {
        this.server = server;
    }
    compile(t, compileOpts) {
        const page = relative(baseViewDir, compileOpts.filename);

        return async context => {
            const DW_DEV_MODE = this.server.methods.isDevMode();
            const config = this.server.methods.config();

            let view;
            try {
                view = await getView(page);
            } catch (e) {
                this.server.log(['sentry'], e);
                const template = await getTemplate('error.ejs', { useCache: !DW_DEV_MODE });
                const output = ejs.render(template, {
                    FAVICON: config.frontend.favicon || '/lib/static/img/favicon.ico',
                    TITLE: 'Template error',
                    HEADING: 'Template error',
                    BODY: DW_DEV_MODE ? `<p>${e.message}</p>` : ''
                });
                return output;
            }
            const { ssr, ssrFunc } = view;

            for (const key in context.stores) {
                // resolve store values in case they are async
                context.stores[key] = await Promise.resolve(context.stores[key]);
            }
            context.props.stores = context.stores;

            try {
                const { css, html, head } = ssrFunc().render(context.props);

                // remove stores that we already have in client-side cache
                Object.keys(context.storeCached).forEach(key => {
                    context.props.stores[key] = {};
                });

                const template = await getTemplate('base.ejs', { useCache: !DW_DEV_MODE });
                const output = ejs.render(template, {
                    HTML_CLASS: context.htmlClass || '',
                    SSR_HEAD: head,
                    SSR_CSS: css.code,
                    NODE_ENV: process.env.NODE_ENV,
                    SSR_HTML: html,
                    GITHEAD:
                        typeof this.server.app.GITHEAD === 'string'
                            ? this.server.app.GITHEAD.substr(0, 8)
                            : undefined,
                    PAGE: page,
                    PAGE_PROPS: jsesc(JSON.stringify(context.props), {
                        isScriptContext: true,
                        json: true,
                        wrap: true
                    }),
                    DW_DEV_MODE,
                    STORE_HASHES: jsesc(JSON.stringify(context.storeHashes), {
                        isScriptContext: true,
                        json: true,
                        wrap: true
                    }),
                    DW_DOMAIN: config.api.domain,
                    MATOMO:
                        config.frontend.matomo && !context.disableMatomo
                            ? config.frontend.matomo
                            : null,
                    SENTRY: (config.frontend.sentry && config.frontend.sentry.clientSide) || null,
                    FAVICON: config.frontend.favicon || '/lib/static/img/favicon.ico',
                    CORE_BEFORE_HEAD: await this.server.methods.getCustomHTML(
                        'core/beforeHead',
                        {}
                    ),
                    CORE_AFTER_HEAD: await this.server.methods.getCustomHTML('core/afterHead', {}),
                    CORE_BEFORE_BODY: await this.server.methods.getCustomHTML(
                        'core/beforeBody',
                        {}
                    ),
                    CORE_AFTER_BODY: await this.server.methods.getCustomHTML('core/afterBody', {})
                });
                return output;
            } catch (err) {
                const errLines = err.stack.split('\n');
                const errLine = errLines.find(d => d.includes('at eval (eval at runtime'));

                if (errLine) {
                    const [, line] = errLine.match(/<anonymous>:(\d+):(\d+)/);
                    const lines = ssr.split('\n');
                    console.error('Error near:\n');
                    console.error(lines.slice(+line - 3, +line + 4)); // before line
                }
                throw err;
            }
        };
    }
    context(request) {
        return context(request);
    }
    cacheAllViews() {
        views.forEach(getView);
    }
}

module.exports = {
    name: 'utils/svelte-view/index',
    version: '1.0.0',
    async register(server) {
        server.app.SvelteView = new SvelteView(server);

        server.method('getView', getView);
        server.method('registerView', registerView);
        server.method('registerViewComponent', registerViewComponent);

        // Cache all views in memory right after the server starts to prevent a situation that:
        // 1. We start the frontend server.
        // 2. Then sometime later we run `npm run build`.
        // 3. And then a user requests a view that has not been cached yet at the very moment that
        //    rollup is compiling that view. In this case the reading of the compiled view file
        //    could fail, because maybe the file is temporarily deleted or only partially written.
        server.events.on('start', () => {
            server.app.SvelteView.cacheAllViews();
        });

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
