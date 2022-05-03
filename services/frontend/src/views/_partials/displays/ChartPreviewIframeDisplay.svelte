<script>
    import get from '@datawrapper/shared/get';
    import chroma from 'chroma-js';

    /*
     * writable store
     */
    export let chart;

    /*
     * theme object
     */
    export let theme;

    $: previewURL = `/preview/${$chart.id}`;
    $: embedWidth = get($chart, 'metadata.publish.embed-width', 550);
    $: embedHeight = get($chart, 'metadata.publish.embed-height', 450);
    $: background = get(theme, 'data.colors.background', 'white');
    $: borderColor = chroma(background).darken(0.7);
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
        style="background:{background};width:{embedWidth}px; height:{embedHeight}px;border-color:{borderColor}"
    >
        <iframe title={$chart.title} src={previewURL} scrolling="no" />
    </div>
</div>
