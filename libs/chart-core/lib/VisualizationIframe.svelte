<script>
    import Visualization from './Visualization.svelte';
    import get from '@datawrapper/shared/get.js';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import { onMount } from 'svelte';

    export let chart = {};
    export let visualization = {};
    export let teamPublicSettings = {};
    export let theme = {};
    export let locales = {};
    export let textDirection = 'ltr';
    export let translations;
    export let blocks = {};
    export let chartAfterBodyHTML = '';
    export let isPreview;
    export let assets;
    export let externalDataUrl;
    export let outerContainer;
    export let themeDataDark = {};
    export let themeDataLight = {};
    export let renderFlags = {}; // allow tests to pass flags directly
    export let emotion;

    // transparent style means background is set on body
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

    $: customCSS = purifyHtml(get(chart, 'metadata.publish.custom-css', ''), []);

    window.__dwUpdate = newAttrs => {
        Object.assign(chart, newAttrs.chart);
        chart = chart; // to force re-rendering
        if (newAttrs.isStyleDark !== undefined) {
            isStyleDark = newAttrs.isStyleDark;
        }
    };

    onMount(async () => {
        document.body.classList.toggle('plain', isStylePlain);
        document.body.classList.toggle('static', isStyleStatic);
        // the body class "png-export" kept for backwards compatibility
        document.body.classList.toggle('png-export', isStyleStatic);
        document.body.classList.toggle('transparent', isStyleTransparent);
        if (isStyleStatic) {
            document.body.style['pointer-events'] = 'none';
        }
    });
</script>

<svelte:head>
    <title>{purifyHtml(chart.title, [])}</title>
    <meta name="description" content={get(chart, 'metadata.describe.intro')} />
    {@html purifyHtml('<st' + `yle>${customCSS}</sty` + 'le>', ['style'])}
</svelte:head>

<Visualization
    {chart}
    {visualization}
    {teamPublicSettings}
    {theme}
    {themeDataDark}
    {themeDataLight}
    {locales}
    {translations}
    {blocks}
    {chartAfterBodyHTML}
    isIframe={true}
    {isPreview}
    {assets}
    {externalDataUrl}
    {isStylePlain}
    {isStyleStatic}
    {isStyleTransparent}
    {isStyleDark}
    {isAutoDark}
    {forceLogo}
    {logoId}
    {isEditingAllowed}
    {previewId}
    {outerContainer}
    {textDirection}
    {renderFlags}
    {emotion}
/>
