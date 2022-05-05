<script>
    import get from '@datawrapper/shared/get';
    import chroma from 'chroma-js';

    /*
     * writable chart store
     */
    export let chart;

    /*
     * theme object
     */
    export let theme;

    $: width = customWidth || get($chart, 'metadata.publish.embed-width', 550);
    $: height = customHeight || get($chart, 'metadata.publish.embed-height', 450);
    $: background = get(theme, 'data.colors.background', 'white');
    $: borderColor = chroma(background).darken(0.7);
    $: border = customBorder === null ? 10 : customBorder;

    $: url = customSrc || `/preview/${$chart.id}`;

    let customWidth;
    let customHeight;
    let customSrc;
    let customBorder = null;

    /**
     * this method can be used by chart actions to change the
     * preview iframe shown in the publish step
     */
    export function set({ src, width, height, border }) {
        if (width) customWidth = width;
        if (height) customHeight = height;
        if (border !== undefined) customBorder = border;
        if (src) customSrc = src;
    }

    /**
     * resets the preview iframe
     */
    export function reset() {
        customWidth = null;
        customHeight = null;
        customSrc = null;
        customBorder = null;
    }
</script>

<style>
    .iframe-wrapper {
        position: sticky;
        top: 20px;
    }
    .iframe-border {
        padding: 10px;
        margin: 0 auto;
        border: 1px solid #ddd;
    }
    iframe {
        width: 100%;
        height: 100%;
    }
</style>

<div class="iframe-wrapper">
    <div
        class="iframe-border"
        style="background:{background};width:{width}px; height:{height}px;border-color:{borderColor}; padding:{border}px"
    >
        <iframe title={$chart.title} src={url} scrolling="no" />
    </div>
</div>
