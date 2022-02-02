'use strict';

const EventEmmiter = require('events');
const { join, relative } = require('path');
const { readFile } = require('fs').promises;
const parallelLimit = require('async/parallelLimit');
const { setCache, withCache } = require('./cache');
const { build, watch, init } = require('./rollup-runtime');
const ejs = require('ejs');
const jsesc = require('jsesc');

let template;
let server;

const templateQueue = [];
const watchers = new Set();
const wsClients = new Set();

function prepareView(page) {
    templateQueue.push(page);
}

function prepareAllViews(writeFileCache = false) {
    return parallelLimit(
        templateQueue.map(page => {
            return async () => {
                await getView(page, writeFileCache);
            };
        }),
        4
    );
}

function getView(page, writeFileCache = false) {
    return withCache(page, () => compilePage(page), writeFileCache);
}

async function compilePage(page) {
    try {
        process.stdout.write(`Compiling ${page}\n`);
        const ssr = await build(page, true);
        const csr = await build(page, false);
        return {
            ssr: ssr.code,
            csr: csr.code,
            csrMap: csr.map,
            error: null
        };
    } catch (err) {
        console.error(`Error: Svelte compile error in ${page}`);
        return { error: err };
    }
}

function watchPage(page) {
    const eventEmmiter = new EventEmmiter();
    if (!watchers.has(page)) {
        // watch
        watchers.add(page);
        process.stdout.write(`Starting rollup watch for ${page}\n`);
        watch(page, (error, result) => {
            if (error) {
                console.error(error);
                return;
            }
            process.stdout.write(`Updated csr/ssr cache for ${page}\n`);
            // update cache
            eventEmmiter.emit('change', result);
            // notify page
            if (wsClients) {
                wsClients.forEach(ws =>
                    ws.send(
                        JSON.stringify({
                            page
                        })
                    )
                );
            }
        });
    }
    return eventEmmiter;
}

const SvelteView = {
    compile(t, compileOpts) {
        const baseViewDir = join(__dirname, '../../views');
        const page = relative(baseViewDir, compileOpts.filename);

        return async function runtime(context) {
            if (!template || process.env.DW_DEV_MODE) {
                template = await readFile(join(__dirname, 'template.ejs'), 'utf8');
            }

            const config = server.methods.config();

            if (process.env.DW_DEV_MODE) {
                watchPage(page).on('change', result => setCache(page, result));
            }
            const { ssr, error } = await getView(page);

            if (error) {
                // @todo: show a nicer error message on production
                return `
            <h1>Error in template ${error.filename}:${error.start ? error.start.line : ''}</h1>
            <big>${error.message}</big>
            <pre>${error.frame}</pre>`;
            }
            for (var key in context.stores) {
                // resolve store values in case they are async
                context.stores[key] = await Promise.resolve(context.stores[key]);
            }
            context.props.stores = context.stores;

            // eslint-disable-next-line
            try {
                const ssrFunc = new Function(ssr + ';return App');

                const { css, html, head } = ssrFunc().render(context.props);

                // remove stores that we already have in client-side cache
                Object.keys(context.storeCached).forEach(key => {
                    context.props.stores[key] = {};
                });

                const output = ejs.render(template, {
                    HTML_CLASS: context.htmlClass || '',
                    SSR_HEAD: head,
                    SSR_CSS: css.code,
                    NODE_ENV: process.env.NODE_ENV,
                    SSR_HTML: html,
                    PAGE: page,
                    PAGE_PROPS: jsesc(JSON.stringify(context.props), {
                        isScriptContext: true,
                        json: true,
                        wrap: true
                    }),
                    DW_DEV_MODE: process.env.DW_DEV_MODE,
                    STORE_HASHES: jsesc(JSON.stringify(context.storeHashes), {
                        isScriptContext: true,
                        json: true,
                        wrap: true
                    }),
                    DW_DOMAIN: config.api.domain,
                    MATOMO: config.frontend.matomo || null
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
    },
    context: require('./context'),
    init(_server) {
        server = _server;
        // also initialize rollup-runtime
        init(_server);
    }
};

module.exports = {
    getView,
    prepareView,
    prepareAllViews,
    SvelteView,
    wsClients,
    watchPage(page) {
        if (process.env.DW_DEV_MODE) {
            watchPage(page).on('change', result => setCache(page, result));
        }
    }
};
