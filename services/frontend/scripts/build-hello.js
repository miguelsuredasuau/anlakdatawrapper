#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const chartCore = require('@datawrapper/chart-core');
const fastGlob = require('fast-glob');
const { getInfo } = require('@el3um4s/svelte-get-component-info');

(async () => {
    const noop = d => d;

    const server = {
        app: {
            GITHEAD: ''
        },
        events: { on: noop },
        method: noop,
        log: console.log, // eslint-disable-line no-console
        methods: {
            config() {
                return {
                    api: {
                        domain: ''
                    },
                    frontend: {}
                };
            },
            isDevMode() {
                return false;
            },
            getCustomHTML() {
                return '';
            }
        }
    };

    await require(path.join(__dirname, '../src/utils/svelte-view/index.js')).register(server);

    const { SvelteView } = server.app;
    const render = SvelteView.compile(null, {
        filename: path.join(__dirname, '../src/views/hello/Index.svelte')
    });

    const iconPath = path.resolve(
        path.dirname(require.resolve('@datawrapper/icons/package.json')),
        'src/icons'
    );
    const icons = (await fs.readdir(iconPath)).map(file => file.replace('.svg', ''));

    const componentInfos = Object.fromEntries(
        (
            await fastGlob([path.join(__dirname, '../src/views/_partials', '**/*.svelte')], {
                dot: true
            })
        ).map(file => [path.relative(path.join(__dirname, '../src/views'), file), getInfo(file)])
    );

    const html = await render({
        stores: {
            config: {
                apiDomain: '',
                frontendDomain: '',
                imageDomain: '',
                dev: true,
                footerLinks: [],
                languages: [],
                headerLinks: [],
                stickyHeaderThreshold: 800,
                GITHEAD: 'x',
                chartLocales: []
            },
            request: {
                path: ''
            },
            messages: {},
            user: {
                language: 'en-US'
            },
            browser: {
                isIE: false
            }
        },
        storeCached: {},
        storeHashes: {},
        props: {
            magicNumber: 42,
            componentInfos,
            icons
        },
        csrRoot: '',
        libRoot: 'lib/',
        vendorRoot: 'lib/vendor/'
    });

    // write libs
    const outDir = path.join(__dirname, '../build/hello');
    await Promise.all([
        fs.writeFile(path.join(outDir, 'index.html'), html),
        fs.copy(path.join(__dirname, '..', 'static'), path.join(outDir, 'lib/static')),
        fs.copy(chartCore.path.dist, path.join(outDir, 'lib/chart-core')),
        fs.copy(
            path.join(__dirname, '../../php/www/static/vendor/font-awesome/'),
            path.join(outDir, 'lib/vendor/font-awesome')
        ),
        fs.copy(
            path.join(__dirname, '../../php/www/static/vendor/iconicfont/'),
            path.join(outDir, 'lib/vendor/iconicfont')
        ),
        fs.copy(
            path.resolve(
                path.dirname(require.resolve('@datawrapper/polyfills/package.json')),
                'polyfills'
            ),
            path.join(outDir, 'lib/polyfills')
        ),
        fs.copy(
            path.dirname(require.resolve('requirejs/package.json')),
            path.join(outDir, 'lib/requirejs')
        ),
        fs.copy(
            path.resolve(path.dirname(require.resolve('@datawrapper/icons/package.json')), 'build'),
            path.join(outDir, 'lib/icons')
        )
    ]);
})();
