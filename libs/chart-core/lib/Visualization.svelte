<script>
    /* globals dw */
    import { onMount, tick, afterUpdate, beforeUpdate } from 'svelte';
    import BlocksRegion from './BlocksRegion.svelte';
    import Menu from './Menu.svelte';
    import Headline from './blocks/Headline.svelte';
    import HeadlineStyles from './blocks/Headline.styles.js';
    import Description from './blocks/Description.svelte';
    import DescriptionStyles from './blocks/Description.styles.js';
    import Source from './blocks/Source.svelte';
    import Byline from './blocks/Byline.svelte';
    import Notes from './blocks/Notes.svelte';
    import NotesStyles from './blocks/Notes.styles.js';
    import GetTheData from './blocks/GetTheData.svelte';
    import EditInDatawrapper from './blocks/EditInDatawrapper.svelte';
    import Embed from './blocks/Embed.svelte';
    import Logo from './blocks/Logo.svelte';
    import Rectangle from './blocks/Rectangle.svelte';
    import Watermark from './blocks/Watermark.svelte';
    import HorizontalRule from './blocks/HorizontalRule.svelte';
    import svgRule from './blocks/svgRule.svelte';
    import migrate from './migrate';
    import {
        aboveFooterStyles,
        belowFooterStyles,
        belowHeaderStyles,
        chartBodyStyles,
        chartFooterStyles,
        chartHeaderStyles,
        chartStyles,
        globalStyles,
        updateGlobalStyles
    } from './themeStyles.js';

    import { domReady, width } from './dw/utils/index.mjs';
    import observeFonts from '@datawrapper/shared/observeFonts.js';
    import deepmerge from 'deepmerge';
    import get from '@datawrapper/shared/get.js';
    import set from '@datawrapper/shared/set.js';
    import { loadScript, loadStylesheet } from '@datawrapper/shared/fetch.js';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import invertColor from '@datawrapper/shared/invertColor.js';
    import { getBrowser } from '@datawrapper/polyfills/src/getBrowser';
    import { clean, isTransparentColor, parseFlagsFromURL, computeThemeData } from './shared.mjs';
    import { isObject } from 'underscore';
    import chroma from 'chroma-js';
    import { outerWidth, themeData } from './stores';

    export let chart;
    export let visualization = {};
    export let teamPublicSettings = {};
    export let theme = {};
    export let themeDataDark = {};
    export let themeDataLight = {};
    export let locales = {};
    export let textDirection = 'ltr';
    export let translations;
    export let blocks = {};
    export let chartAfterBodyHTML = '';
    export let isIframe;
    export let isPreview;
    export let assets;
    export let styleHolder;
    export let origin;
    export let externalDataUrl;
    export let outerContainer;
    // transparent style means no background is set on body
    export let isStyleTransparent = false;
    // plain style means no header and footer
    export let isStylePlain = false;
    // static style means user can't interact (e.g. in a png version)
    export let isStyleStatic = false;
    export let isStyleDark = false;
    // autodark means dark/light display follows user prefers-color-scheme
    export let isAutoDark = false;
    // can be on|off|auto (on/off will overwrite chart setting)
    export let forceLogo = 'auto';
    export let logoId = null;
    export let isEditingAllowed = false;
    export let previewId = null;
    export let renderFlags = {};

    export let emotion;

    export let frontendDomain = 'app.datawrapper.de';

    // .dw-chart-body
    let target, dwChart, vis;
    let postEvent = () => {};
    let flags = { isIframe, isEditingAllowed, previewId };

    let useFallbackImage = false;

    const FLAG_TYPES = {
        plain: Boolean,
        static: Boolean,
        svgonly: Boolean,
        map2svg: Boolean,
        transparent: Boolean,
        fitchart: Boolean,
        fitheight: Boolean,
        theme: String,
        search: String,
        previewId: String
    };

    const datasetName = `dataset.${get(chart.metadata, 'data.json') ? 'json' : 'csv'}`;

    // apply core metadata migrations
    migrate(chart.metadata);

    $: if (!get(chart, 'metadata.publish.blocks')) {
        // no footer settings found in metadata, apply theme defaults
        set(chart, 'metadata.publish.blocks', get($themeData, 'metadata.publish.blocks'));
    }

    const allowedAriaDescriptionTags = [
        'a',
        'span',
        'b',
        'br',
        'i',
        'strong',
        'sup',
        'sub',
        'strike',
        'u',
        'em',
        'tt',
        'table',
        'thead',
        'tbody',
        'tfoot',
        'caption',
        'colgroup',
        'col',
        'tr',
        'td',
        'th'
    ];
    $: ariaDescription = get(chart, 'metadata.describe.aria-description', '');

    $: customCSS = purifyHtml(get(chart, 'metadata.publish.custom-css', ''), []);
    $: metadataFields = {
        custom: get(chart, 'metadata.custom', {}),
        publish: get(chart, 'metadata.publish', {}),
        describe: get(chart, 'metadata.describe', {})
    };

    $: overrideContext = {
        type: chart.type,
        title: chart.title,
        team: chart.organizationId,
        width: $outerWidth,
        mode: {
            plain: isStylePlain,
            static: isStyleStatic,
            print: !!flags.svgonly
        },
        ...metadataFields,
        blocks: Object.fromEntries(
            [...coreBlocks, ...pluginBlocks]
                .filter(({ includeInContext }) => includeInContext)
                .map(block => [
                    block.id,
                    !block.test || block.test({ chart, isStyleStatic, dwChart })
                ])
        )
    };

    $: $themeData = computeThemeData(isStyleDark ? themeDataDark : themeDataLight, overrideContext);

    const coreBlocks = [
        {
            id: 'headline',
            tag: 'h3',
            region: 'header',
            priority: 10,
            // we can only include blocks whose presence does not depend on themeData
            includeInContext: true,
            styles: HeadlineStyles,
            test: ({ chart }) => chart.title && !get(chart, 'metadata.describe.hide-title'),
            component: Headline
        },
        {
            id: 'description',
            tag: 'p',
            region: 'header',
            priority: 20,
            includeInContext: true,
            styles: DescriptionStyles,
            test: ({ chart }) => get(chart, 'metadata.describe.intro'),
            component: Description
        },
        {
            id: 'notes',
            region: 'aboveFooter',
            priority: 10,
            styles: NotesStyles,
            includeInContext: true,
            test: ({ chart }) => get(chart, 'metadata.annotate.notes'),
            component: Notes
        },
        {
            id: 'byline',
            region: 'footerLeft',
            test: ({ chart }) =>
                get(chart, 'metadata.describe.byline', false) || chart.basedOnByline,
            priority: 10,
            includeInContext: true,
            component: Byline
        },
        {
            id: 'source',
            region: 'footerLeft',
            test: ({ chart }) => get(chart, 'metadata.describe.source-name'),
            priority: 20,
            includeInContext: true,
            component: Source
        },
        {
            id: 'get-the-data',
            region: 'footerLeft',
            test: ({ chart, isStyleStatic }) =>
                get(chart, 'metadata.publish.blocks.get-the-data') &&
                !isStyleStatic &&
                chart.type !== 'locator-map',
            priority: 30,
            includeInContext: true,
            component: GetTheData
        },
        {
            id: 'edit',
            region: 'footerLeft',
            test: ({ chart, isStyleStatic }) =>
                get(chart, 'forkable') &&
                get(chart, 'metadata.publish.blocks.edit-in-datawrapper', false) &&
                !isStyleStatic,
            priority: 31,
            includeInContext: true,
            component: EditInDatawrapper
        },
        {
            id: 'embed',
            region: 'footerLeft',
            test: ({ chart, isStyleStatic }) =>
                get(chart, 'metadata.publish.blocks.embed') && !isStyleStatic,
            priority: 40,
            includeInContext: true,
            component: Embed
        },
        {
            id: 'logo',
            region: 'footerRight',
            test: ({ chart, themeData }) => {
                const metadataLogo = get(chart, 'metadata.publish.blocks.logo', {
                    enabled: false
                });
                const themeLogoOptions = get(themeData, 'options.blocks.logo.data.options', []);
                const thisLogoId = logoId || metadataLogo.id;
                let logo = themeLogoOptions.find(logo => logo.id === thisLogoId);
                // fallback to first logo in theme options
                if (!thisLogoId || !logo) logo = themeLogoOptions[0] || {};
                // selected logo has no image or text
                if (!logo.imgSrc && !logo.text) return false;
                if (forceLogo === 'on') return true;
                if (forceLogo === 'off') return false;
                // support both old & new metadata
                return isObject(metadataLogo) ? metadataLogo.enabled : metadataLogo;
            },
            priority: 10,
            includeInContext: false,
            component: Logo
        },
        {
            id: 'rectangle',
            region: 'header',
            test: ({ themeData }) => !!get(themeData, 'options.blocks.rectangle'),
            priority: 1,
            includeInContext: false,
            component: Rectangle
        },
        {
            id: 'watermark',
            region: 'afterBody',
            test: ({ themeData }) => {
                const field = get(themeData, 'options.watermark.custom-field');
                return get(themeData, 'options.watermark')
                    ? field
                        ? get(chart, `metadata.custom.${field}`, '')
                        : get(themeData, 'options.watermark.text', 'CONFIDENTIAL')
                    : false;
            },
            priority: 1,
            includeInContext: false,
            component: Watermark
        },
        hr(0, 'hr'),
        hr(1, 'hr'),
        hr(2, 'hr'),
        hr(0, 'svg-rule'),
        hr(1, 'svg-rule'),
        hr(2, 'svg-rule')
    ];

    function hr(index, type) {
        const id = `${type}${index ? index : ''}`;
        return {
            id,
            region: 'header',
            test: ({ themeData }) => !!get(themeData, `options.blocks.${id}`),
            priority: 0,
            includeInContext: false,
            component: type === 'hr' ? HorizontalRule : svgRule
        };
    }

    let pluginBlocks = [];

    $: allBlocks = applyThemeBlockConfig([...coreBlocks, ...pluginBlocks], $themeData, blockProps);

    $: blockProps = {
        __,
        purifyHtml: clean,
        get,
        postEvent,
        teamPublicSettings,
        themeData: $themeData,
        // @todo: in theory we should remove `theme` from blockProps as all blocks should only
        // use `themeData`, but the logo block still needs the theme title as fallback text
        theme,
        chart,
        dwChart,
        vis,
        caption,
        logoId
    };

    function byPriority(a, b) {
        return (
            (a.priority !== undefined ? a.priority : 999) -
            (b.priority !== undefined ? b.priority : 999)
        );
    }

    function getUrl(src) {
        return origin && src.indexOf('http') !== 0 ? `${origin}/${src}` : src;
    }

    async function loadBlocks(blocks) {
        if (blocks.length) {
            await Promise.all(
                blocks.map(d => {
                    return new Promise(resolve => {
                        if (d.preloaded) return resolve(); // in puppeteer tests, js and css files are preloaded
                        const p = [loadScript(getUrl(d.source.js))];

                        if (d.source.css) {
                            p.push(
                                loadStylesheet({
                                    src: getUrl(d.source.css),
                                    parentElement: styleHolder
                                })
                            );
                        }

                        Promise.all(p)
                            .then(resolve)
                            .catch(err => {
                                // log error
                                const url = err.target
                                    ? err.target.getAttribute('src') ||
                                      err.target.getAttribute('href')
                                    : null;
                                if (url) console.warn('could not load ', url);
                                else console.error('Unknown error', err);
                                // but resolve anyway
                                resolve();
                            });
                    });
                })
            );

            // all scripts are loaded
            blocks.forEach(d => {
                d.blocks.forEach(block => {
                    if (!dw.block.has(block.component)) {
                        return console.warn(
                            `component ${block.component} from chart block ${block.id} not found`
                        );
                    }
                    pluginBlocks.push({
                        ...block,
                        component: dw.block(block.component)
                    });
                });
            });

            // trigger svelte update after modifying array
            pluginBlocks = pluginBlocks;
        }
    }

    function getBlocks(allBlocks, region, props) {
        return allBlocks
            .filter(d => d.region === region)
            .filter(d => !d.test || d.test({ ...d.props, ...props }))
            .filter(d => (d.visible !== undefined ? d.visible : true))
            .sort(byPriority);
    }

    function applyThemeBlockConfig(blocks, themeData, blockProps) {
        return blocks.map(block => {
            block.props = {
                ...(block.data || {}),
                ...blockProps,
                config: { frontendDomain },
                id: block.id
            };
            if (block.component.test) {
                block.test = block.component.test;
            }
            const options = get(themeData, 'options.blocks', {})[block.id];
            if (!options) return block;
            return {
                ...block,
                ...options
            };
        });
    }

    // build all the region
    $: regions = {
        header: getBlocks(allBlocks, 'header', { chart, themeData: $themeData, isStyleStatic }),
        headerRight: getBlocks(allBlocks, 'headerRight', {
            chart,
            themeData: $themeData,
            isStyleStatic
        }),
        belowHeader: getBlocks(allBlocks, 'belowHeader', {
            chart,
            themeData: $themeData,
            isStyleStatic
        }),
        aboveFooter: getBlocks(allBlocks, 'aboveFooter', {
            chart,
            themeData: $themeData,
            isStyleStatic
        }),
        footerLeft: getBlocks(allBlocks, 'footerLeft', {
            chart,
            themeData: $themeData,
            isStyleStatic
        }),
        footerCenter: getBlocks(allBlocks, 'footerCenter', {
            chart,
            themeData: $themeData,
            isStyleStatic
        }),
        footerRight: getBlocks(allBlocks, 'footerRight', {
            chart,
            themeData: $themeData,
            isStyleStatic
        }),
        belowFooter: getBlocks(allBlocks, 'belowFooter', {
            chart,
            themeData: $themeData,
            isStyleStatic
        }),
        afterBody: getBlocks(allBlocks, 'afterBody', {
            chart,
            themeData: $themeData,
            isStyleStatic
        }),
        menu: getBlocks(allBlocks, 'menu', { chart, themeData: $themeData, isStyleStatic })
    };

    $: menu = get($themeData, 'options.menu', {});

    function getCaption(id) {
        if (id === 'd3-maps-choropleth' || id === 'd3-maps-symbols' || id === 'locator-map')
            return 'map';
        else if (id === 'tables') return 'table';
        return 'chart';
    }

    const caption = getCaption(visualization.id);

    function __(key, ...args) {
        if (typeof key !== 'string') {
            key = '';
            console.error(
                new TypeError(`function __ called without required 'key' parameter!
Please make sure you called __(key) with a key of type "string".
`)
            );
        }
        key = key.trim();

        let translation = translations[key] || key;

        if (args.length) {
            translation = translation.replace(/\$(\d)/g, (m, i) => {
                i = +i;
                return args[i] || m;
            });
        }

        return translation;
    }

    async function run() {
        if (typeof dw === 'undefined') return;

        // initialize $outerWidth to compute reactive theme data
        $outerWidth = outerContainer.clientWidth;
        await tick();

        // register theme, including overrides
        theme.data = $themeData;
        dw.theme.register(theme.id, theme.data);

        // register locales
        Object.keys(locales).forEach(vendor => {
            if (locales[vendor] === 'null') {
                locales[vendor] = null;
            }
            if (locales[vendor] && locales[vendor].base) {
                // eslint-disable-next-line
                const localeBase = eval(locales[vendor].base);
                locales[vendor] = deepmerge(localeBase, locales[vendor].custom);
            }
        });
        // read flags
        const newFlags = isIframe ? parseFlagsFromURL(window.location.search, FLAG_TYPES) : {}; // TODO parseFlagsFromElement(scriptEl, FLAG_TYPES);
        Object.assign(flags, newFlags, renderFlags);
        flags = flags;

        const useDwCdn = get(chart, 'metadata.data.use-datawrapper-cdn', true);

        const externalJSON =
            useDwCdn && get(chart, 'metadata.data.external-metadata', '').length
                ? `//${externalDataUrl}/${chart.id}.metadata.json`
                : get(chart, 'metadata.data.external-metadata');

        if (externalJSON && get(chart, 'metadata.data.upload-method') === 'external-data') {
            try {
                const now = new Date().getTime();
                const ts = useDwCdn ? now - (now % 60000) : now;
                const url = `${externalJSON}${externalJSON.includes('?') ? '&' : '?'}v=${ts}`;
                const res = await window.fetch(url);
                const obj = await res.json();
                if (obj.title) {
                    chart.title = obj.title;
                    delete obj.title;
                }

                chart.metadata = deepmerge(chart.metadata, obj);
                chart = chart;
            } catch (e) {
                console.warn('Invalid external metadata JSON, falling back on chart metadata');
            }
        }

        // initialize dw.chart object
        dwChart = dw
            .chart(chart)
            .locale((chart.language || 'en-US').substr(0, 2))
            .translations(translations)
            .theme(dw.theme(chart.theme))
            .flags(flags);

        dwChart.emotion = emotion;

        // register chart assets
        const assetPromises = [];

        for (const [name, { url, value, load = true }] of Object.entries(assets)) {
            const isDataset = name === datasetName;
            const useLiveData = chart.externalData;

            if (!isDataset || !useLiveData) {
                if (url) {
                    if (load) {
                        const assetName = name;
                        assetPromises.push(
                            // eslint-disable-next-line
                            new Promise(async resolve => {
                                const res = await fetch(getUrl(assets[assetName].url));
                                const text = await res.text();
                                dwChart.asset(assetName, text);
                                resolve();
                            })
                        );
                    } else {
                        dwChart.asset(name, url);
                    }
                } else {
                    dwChart.asset(name, value);
                }
            }
        }
        await Promise.all(assetPromises);

        // initialize dw.vis object
        vis = dw.visualization(visualization.id, target);
        vis.meta = visualization;
        vis.lang = chart.language || 'en-US';
        vis.textDirection = textDirection;

        // load chart data and assets
        await dwChart.load(dwChart.asset(datasetName) || '', chart.externalData);
        dwChart.locales = locales;
        dwChart.vis(vis);

        // load & register blocks
        await loadBlocks(blocks);

        // add theme._computed to theme.data for better dark mode support
        theme.data._computed = theme._computed;

        const browserSupportsPrefersColorScheme = CSS.supports('color-scheme', 'dark');

        // we only apply dark mode if base theme is light
        const lightBg = get(themeDataLight, 'colors.background', '#ffffff');
        if (chroma(lightBg).luminance() >= 0.3) {
            vis.initDarkMode(
                onDarkModeChange,
                initDarkModeColormap({ themeDataDark, themeDataLight })
            );
            if (isStyleDark) vis.darkMode(true);
        }

        if (!isPreview && isAutoDark) {
            const matchMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            // for browsers that don't support prefers-color-scheme
            if (!browserSupportsPrefersColorScheme) updateActiveCSS(matchMediaQuery.matches);

            matchMediaQuery.addEventListener('change', e => {
                updateDarkModeState(e.matches);
            });
        }

        if (!useFallbackImage) {
            // render chart
            if (window.parent === window) {
                console.time('Chart rendered in'); // eslint-disable-line no-console
            }
            dwChart.render(outerContainer);
            if (window.parent === window) {
                console.timeEnd('Chart rendered in'); // eslint-disable-line no-console
            }

            // await necessary reload triggers
            observeFonts(theme.fonts, theme.data.typography)
                .then(() => dwChart.render(outerContainer))
                .catch(() => dwChart.render(outerContainer));

            // iPhone/iPad fix
            if (/iP(hone|od|ad)/.test(navigator.platform)) {
                window.onload = dwChart.render(outerContainer);
            }

            isIframe && initResizeHandler(target);
        }

        function updateActiveCSS(isDark) {
            // @todo: access these without using document
            const cssLight = document.getElementById('css-light');
            const cssDark = document.getElementById('css-dark');
            (isDark ? cssLight : cssDark).setAttribute('media', '--disabled--');
            (isDark ? cssDark : cssLight).removeAttribute('media');
        }

        function updateDarkModeState(isDark) {
            isStyleDark = isDark;
            if (!browserSupportsPrefersColorScheme) updateActiveCSS(isDark);
            vis.darkMode(isDark);
        }

        async function updateChartThemeData() {
            // wait for reactive themeData to be ready
            await tick();
            /*
             * Preserve pre-existing theme object,
             * as render code generally captures vis.theme() in variable just once.
             *
             * @todo: Implement more foolproof solution. E.g using svelte/store
             */
            Object.keys(theme.data).forEach(key => {
                if (key !== '_computed') delete theme.data[key];
                if ($themeData[key]) theme.data[key] = $themeData[key];
            });
        }

        async function onDarkModeChange(isDark) {
            await updateChartThemeData();

            // swap active css
            if (isPreview || !isAutoDark || (isAutoDark && !browserSupportsPrefersColorScheme)) {
                updateActiveCSS(isDark);
            }

            // revert dark palette to prevent double-mapping
            if (isDark) {
                set(theme.data, 'colors.palette', get(themeDataLight, 'colors.palette', []));
            }
            outerContainer.classList.toggle('is-dark-mode', isDark);
            dwChart.render(outerContainer);
        }

        function initResizeHandler(container) {
            let reloadTimer;

            function resize() {
                clearTimeout(reloadTimer);
                $outerWidth = outerContainer.clientWidth;
                reloadTimer = setTimeout(async function () {
                    await updateChartThemeData();
                    dwChart.vis().fire('resize');
                    dwChart.render(outerContainer);
                }, 200);
            }

            let currentWidth = width(container);
            const resizeFixed = () => {
                const w = width(container);
                if (currentWidth !== w) {
                    currentWidth = w;
                    resize();
                }
            };

            const fixedHeight = dwChart.getHeightMode() === 'fixed';
            const resizeHandler = fixedHeight ? resizeFixed : resize;

            window.addEventListener('resize', resizeHandler);
        }

        return dwChart;
    }

    onMount(async () => {
        useFallbackImage = getBrowser().browser === 'ie' && !isPreview;
        const dwChart = await run();

        outerContainer.classList.toggle('dir-rtl', textDirection === 'rtl');

        if (isIframe) {
            // set some classes - still needed?
            document.body.classList.toggle('plain', isStylePlain);
            document.body.classList.toggle('static', isStyleStatic);
            document.body.classList.toggle('png-export', isStyleStatic);
            document.body.classList.toggle('transparent', isStyleTransparent);
            document.body.classList.toggle('in-editor', isEditingAllowed);

            if (isStyleStatic) {
                document.body.style['pointer-events'] = 'none';
            }

            if (isStyleStatic && !isStyleTransparent) {
                const bodyBackground = get(theme.data, 'style.body.background', 'transparent');
                const previewBackground = get(theme.data, 'colors.background');
                if (previewBackground && isTransparentColor(bodyBackground)) {
                    document.body.style.background = previewBackground;
                }
            }

            // fire events on hashchange
            domReady(() => {
                postEvent = dwChart.createPostEvent();
                window.addEventListener('hashchange', () => {
                    postEvent('hash.change', { hash: window.location.hash });
                });
            });

            // watch for height changes - still needed?
            let currentHeight = document.body.offsetHeight;
            afterUpdate(() => {
                const newHeight = document.body.offsetHeight;
                if (currentHeight !== newHeight && typeof dwChart.render === 'function') {
                    dwChart.render(outerContainer);
                    currentHeight = newHeight;
                }
            });

            /*
             * Swap emotion class on .dw-chart-body via classList.toggle instead of directly on element
             * to prevent entire class attribute getting updated when emotion class changes,
             * since that removes classes set on .dw-chart-body by render code.
             *
             * TODO: resolve the issue of conflicting class name toggles by
             *
             * - toggling "global" classes like `.dir-rtl` on parent container (.dw-chart)
             *   whose `class` property is not set/managed by Svelte
             *
             * - make sure that vis render code (such as d3-bars) is not toggling
             *   classes on elements that are managed by this Svelte component,
             *   e.g. by passing these visualizations a new div to render the
             *   charts into.
             *
             */
            beforeUpdate(() => {
                if (prevChartBodyEmotionClass !== chartBodyEmotionClass) {
                    [prevChartBodyEmotionClass, chartBodyEmotionClass].forEach((cl, i) => {
                        if (cl) target.classList.toggle(cl, !!i);
                    });
                    prevChartBodyEmotionClass = chartBodyEmotionClass;
                }
            });

            // provide external APIs
            window.__dw = window.__dw || {};
            window.__dw.params = {
                data: dwChart.asset(datasetName),
                visJSON: visualization
            };
            window.__dw.vis = vis;
            window.__dw.render = () => {
                dwChart.render(outerContainer);
            };
            window.fontsJSON = theme.fonts;
            window.getThemeData = key => get(themeDataLight, key);
            window.setThemeData = (key, value) => {
                set(themeDataLight, key, value);
                themeDataLight = themeDataLight;
            };
            window.setTheme = async id => {
                const res = await fetch(`http://api.datawrapper.local/v3/themes/${id}?extend=true`);
                const { data, fontsCSS } = await res.json();
                themeDataLight = data;
                theme.data = data;
                document.querySelector('style').innerText = fontsCSS;
                dwChart.render(outerContainer);
                // const st = document.createElement('style');
                // st.innerHTML = fontsCSS;
                // document.head.appendChild(st);
            };
        }
    });

    function initDarkModeColormap({ themeDataLight, themeDataDark }) {
        const colorCache = new Map();
        const darkPalette = get(themeDataDark, 'colors.palette', []);
        const lightPalette = get(themeDataLight, 'colors.palette', []);

        const lightBg = get(themeDataLight, 'colors.background', '#ffffff');
        const darkBg = get(themeDataDark, 'colors.background');

        const themeColorMap = Object.fromEntries(
            lightPalette.map((light, i) => [light.toLowerCase(), darkPalette[i]])
        );

        return function (color, { forceInvert, noInvert } = {}) {
            const darkModeNoInvert = !vis.get('dark-mode-invert', true);
            if (noInvert || (darkModeNoInvert && !forceInvert)) return color;

            if (!chroma.valid(color)) return color;

            color = color.toLowerCase();

            if (themeColorMap[color]) {
                // theme has a hard replacement color
                return themeColorMap[color];
            }

            if (colorCache.has(color)) {
                // we've already mapped this color
                return colorCache.get(color);
            }

            colorCache.set(color, invertColor(color, darkBg, lightBg, 0.85));

            return colorCache.get(color);
        };
    }

    $: contentBelowChart =
        !isStylePlain &&
        (regions.aboveFooter.length ||
            regions.footerLeft.length ||
            regions.footerCenter.length ||
            regions.footerRight.length ||
            regions.belowFooter.length ||
            regions.afterBody.length);

    $: footerRegionLayout = {
        Left: get($themeData, 'options.footer.left.layout', 'inline'),
        Center: get($themeData, 'options.footer.center.layout', 'inline'),
        Right: get($themeData, 'options.footer.right.layout', 'inline')
    };

    $: if (emotion) updateGlobalStyles(globalStyles(emotion, $themeData));

    let prevChartBodyEmotionClass = '';
    $: chartBodyEmotionClass = emotion ? chartBodyStyles(emotion, $themeData) : '';
</script>

<style lang="scss">
    :global(body),
    :global(.web-component-body) {
        margin: 0;
        padding: 0;
        &.in-editor {
            padding-bottom: 10px;
        }
    }

    .dw-chart-styles {
        height: 100%;
    }

    :global(.chart) {
        height: 100%;

        &.dir-rtl {
            :global(.dw-chart-header),
            :global(.dw-below-header),
            :global(.dw-above-footer),
            :global(.dw-below-footer),
            .dw-chart-footer {
                direction: rtl;
                unicode-bidi: embed;
            }
        }
        &.is-dark-mode :global(.hide-in-dark) {
            display: none;
        }

        &:not(.is-dark-mode) :global(.hide-in-light) {
            display: none;
        }

        &.vis-height-fit {
            overflow: hidden;
            .dw-chart-styles {
                overflow: hidden;
            }
        }
        :global(.sr-only) {
            position: absolute;
            left: -9999px;
            height: 1px;
        }
        &.plain #footer {
            height: 10px;
        }

        &.js :global(.noscript) {
            display: none;
        }

        :global(.hidden),
        :global(.hide) {
            display: none;
        }

        :global(.filter-ui) {
            &.filter-links {
                height: 30px;
                overflow-x: hidden;
                overflow-y: hidden;
                line-height: 28px;

                :global(a) {
                    height: 28px;
                    padding: 10px;
                    text-decoration: none;

                    &.active {
                        box-shadow: none;
                        cursor: default;
                        text-decoration: none;
                        padding: 10px 10px 6px 10px;
                    }
                }
            }

            &.filter-select {
                vertical-align: middle;
            }

            :global(.point) {
                display: inline-block;
                position: absolute;
                cursor: pointer;
                z-index: 100;

                height: 20px;
                width: 20px;
                border-radius: 20px;
                top: 20px;

                &.active {
                    height: 20px;
                    width: 20px;
                    border-radius: 20px;
                    top: 20px;
                }
            }

            :global(.point-label) {
                position: absolute;
            }

            :global(.line) {
                height: 1px;
                position: absolute;
                left: 0px;
                top: 30px;
                z-index: 1;
            }
        }
    }

    :global(.dw-chart-header) {
        min-height: 1px;
        position: relative;
        overflow: auto;

        .header-right {
            position: absolute;
            right: 10px;
            z-index: 20;
        }

        &.has-header-right {
            display: flex;
            justify-content: space-between;

            &.has-menu > :last-child {
                margin-right: 25px;
            }
        }
    }

    .dw-chart-footer {
        display: flex;
        justify-content: space-between;

        .footer-block {
            display: inline;

            &.hidden {
                display: none;
            }

            a[href=''] {
                pointer-events: none;
                text-decoration: none;
                padding: 0;
                border-bottom: 0;
            }
        }

        .layout-inline > .footer-block {
            display: inline;
        }
        .layout-flex-row,
        .layout-flex-column {
            display: flex;
        }
        .layout-flex-row {
            flex-direction: row;
        }
        .layout-flex-column {
            flex-direction: column;
        }

        /** flex-column alignments **/
        .footer-center.layout-flex-column {
            align-items: center;
        }
        .footer-right.layout-flex-column {
            align-items: flex-end;
        }
        /**  block alignments **/
        .footer-center.layout-inline {
            text-align: center;
        }
        .footer-right.layout-inline {
            text-align: right;
        }

        .separator {
            display: inline-block;
            font-style: initial;

            &:before {
                display: inline-block;
            }
        }

        & > div > :global(a:first-child::before),
        & > div > :global(.source-block:first-child::before),
        & > div > .footer-block:first-child::before {
            content: '';
            display: none;
        }

        .footer-right {
            text-align: right;
        }
    }

    :global(.dw-above-footer),
    :global(.dw-below-footer) {
        position: relative;
    }

    // static style (make links look like normal text)
    :global(.static .chart a) {
        color: currentColor;
        text-decoration: none;
        border-bottom: none;
        font-weight: unset;
        font-style: unset;
    }

    :global(a img) {
        border: 0px;
    }

    .hide {
        display: none;
    }

    .dw-after-body {
        position: absolute;
    }

    :global(svg rect) {
        shape-rendering: crispEdges;
    }
</style>

<div
    class:static={isStyleStatic}
    class="dw-chart-styles {emotion ? chartStyles(emotion, $themeData) : ''}"
>
    {#if !isStylePlain}
        {#if !regions.headerRight.length}
            <BlocksRegion
                name="dw-chart-header"
                blocks={regions.header}
                id="header"
                {emotion}
                styles={chartHeaderStyles}
            />
        {:else}
            <div
                class="dw-chart-header has-header-right {emotion
                    ? chartHeaderStyles(emotion, $themeData)
                    : ''}"
                class:has-menu={!isStyleStatic && regions.menu.length}
            >
                <BlocksRegion
                    name="dw-chart-header-left"
                    {emotion}
                    blocks={regions.header}
                    id="header"
                />
                <BlocksRegion name="dw-chart-header-right" {emotion} blocks={regions.headerRight} />
            </div>
        {/if}

        <BlocksRegion
            name="dw-below-header"
            blocks={regions.belowHeader}
            {emotion}
            styles={belowHeaderStyles}
        />

        {#if !isStyleStatic}
            <Menu name="dw-chart-menu" props={menu} blocks={regions.menu} {emotion} />
        {/if}
    {/if}

    {#if ariaDescription}
        <div class="sr-only">
            {@html purifyHtml(ariaDescription, allowedAriaDescriptionTags)}
        </div>
    {/if}

    <div
        id="chart"
        bind:this={target}
        class:content-below-chart={contentBelowChart}
        aria-hidden={!!ariaDescription}
        class="dw-chart-body"
    >
        {#if useFallbackImage}
            <img
                style="max-width: 100%"
                src="../plain.png"
                aria-hidden="true"
                alt="fallback image"
            />
            <p style="opacity:0.6;padding:1ex; text-align:center">
                {__('fallback-image-note')}
            </p>
        {:else}
            <noscript>
                <img
                    style="max-width: 100%"
                    src="../plain.png"
                    aria-hidden="true"
                    alt="fallback image"
                />
                <p style="opacity:0.6;padding:1ex; text-align:center">
                    {__('fallback-image-note')}
                </p>
            </noscript>
        {/if}
    </div>

    {#if get(theme, 'data.template.afterChart')}
        {@html theme.data.template.afterChart}
    {/if}

    {#if !isStylePlain}
        <BlocksRegion
            name="dw-above-footer"
            blocks={regions.aboveFooter}
            {emotion}
            styles={aboveFooterStyles}
        />

        <div
            id="footer"
            class="dw-chart-footer {emotion ? chartFooterStyles(emotion, $themeData) : ''}"
        >
            {#each ['Left', 'Center', 'Right'] as orientation}
                <div
                    class="footer-{orientation.toLowerCase()}  layout-{footerRegionLayout[
                        orientation
                    ]}"
                >
                    {#each regions['footer' + orientation] as block, i}
                        {#if i && footerRegionLayout[orientation] === 'inline'}
                            <span class="separator separator-before-{block.id}" />
                        {/if}
                        <span
                            class="footer-block {block.id}-block {emotion && block.styles
                                ? block.styles(emotion, $themeData)
                                : ''}"
                        >
                            {#if block.prepend}
                                <span class="prepend">
                                    {@html clean(block.prepend)}
                                </span>
                            {/if}
                            <span class="block-inner">
                                <svelte:component this={block.component} props={block.props} />
                            </span>
                            {#if block.append}
                                <span class="append">
                                    {@html clean(block.append)}
                                </span>
                            {/if}
                        </span>
                    {/each}
                </div>
            {/each}
        </div>

        <BlocksRegion
            name="dw-below-footer"
            blocks={regions.belowFooter}
            {emotion}
            styles={belowFooterStyles}
        />
    {/if}

    <div class="dw-after-body">
        {#each regions.afterBody as block}
            <svelte:component this={block.component} props={block.props} />
        {/each}
    </div>

    {#if chartAfterBodyHTML}
        {@html chartAfterBodyHTML}
    {/if}
</div>
