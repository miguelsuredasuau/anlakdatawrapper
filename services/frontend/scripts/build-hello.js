const path = require('path');
const fs = require('fs-extra');
const chartCore = require('@datawrapper/chart-core');

(async () => {
    const noop = d => d;

    const server = {
        app: {
            GITHEAD: ''
        },
        events: { on: noop },
        method: noop,
        // eslint-disable-next-line
        log: console.log,
        methods: {
            config() {
                return {
                    api: {
                        domain: ''
                    },
                    frontend: {}
                };
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
            icons
        }
    });
    const relativeRefs = html
        .replace(/: '\/lib\//g, ": 'lib/")
        .replace(/href="\/static\/vendor\//g, 'href="lib/vendor/')
        .replace(/src="\/lib\//g, 'src="lib/')
        .replace(/href="\/lib\//g, 'href="lib/');

    const outDir = path.join(__dirname, '../build/hello');
    await fs.mkdirp(outDir);
    await fs.mkdirp(path.join(outDir, 'lib/csr/hello'));
    await fs.mkdirp(path.join(outDir, 'lib/csr/_partials'));

    const bundle = await fs.readFile(
        path.join(__dirname, '../build/views/hello/Index.svelte.csr.js'),
        'utf-8'
    );
    const bundleRel = bundle
        .replace(/\/lib\/csr\//g, 'lib/csr/')
        .replace(/@import '\/lib\/codemirror/g, "@import 'lib/codemirror")
        .replace(/\/lib\/icons\//g, 'lib/icons/');

    // write libs
    await Promise.all([
        fs.writeFile(path.join(outDir, 'index.html'), relativeRefs),
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
            path.dirname(require.resolve('codemirror/package.json')),
            path.join(outDir, 'lib/codemirror')
        ),
        fs.copy(
            path.dirname(require.resolve('jsonlint/web/jsonlint.js')),
            path.join(outDir, 'lib/jsonlint')
        ),
        fs.copy(
            path.resolve(path.dirname(require.resolve('@datawrapper/icons/package.json')), 'build'),
            path.join(outDir, 'lib/icons')
        ),
        fs.writeFile(path.join(outDir, 'lib/csr/hello/Index.svelte.js'), bundleRel),
        fs.copy(
            path.join(__dirname, '../build/views/hello/Index.svelte.csr.js.map'),
            path.join(outDir, 'lib/csr/hello/Index.svelte.js.map')
        ),
        fs.copy(
            path.join(
                __dirname,
                '../build/views/_partials/svelte2/Svelte2Wrapper.element.svelte.csr.js'
            ),
            path.join(outDir, 'lib/csr/_partials/svelte2/Svelte2Wrapper.element.svelte.js')
        ),
        fs.copy(
            path.join(
                __dirname,
                '../build/views/_partials/svelte2/Svelte2Wrapper.element.svelte.csr.js.map'
            ),
            path.join(outDir, 'lib/csr/_partials/svelte2/Svelte2Wrapper.element.svelte.js.map')
        )
    ]);
})();
