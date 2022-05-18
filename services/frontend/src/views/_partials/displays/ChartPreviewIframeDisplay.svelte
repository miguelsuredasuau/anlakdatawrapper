<script>
    import { createEventDispatcher } from 'svelte';
    import get from '@datawrapper/shared/get';
    import chroma from 'chroma-js';
    import { headerProps } from '_layout/stores';

    const dispatch = createEventDispatcher();

    /*
     * writable chart store
     */
    export let chart;

    /*
     * theme object
     */
    export let theme;

    export let sticky = true;

    $: width = customWidth || get($chart, 'metadata.publish.embed-width', 550);
    $: height = customHeight || fixedHeight || get($chart, 'metadata.publish.embed-height', 450);
    $: background = customBackground || get(theme, 'data.colors.background', 'white');
    $: borderColor = chroma.valid(background) ? chroma(background).darken(0.7) : background;
    $: border = customBorder === null ? 10 : customBorder;
    $: scale = customScale || 1;

    $: src = customSrc || `/preview/${$chart.id}`;
    let prevSrc;

    let customWidth;
    let customHeight;
    let fixedHeight;
    let customSrc;
    let customBorder = null;
    let customScale;
    let customBackground;

    let iframe;
    export let loading = false;

    let contentWindow;
    let contentDocument;

    $: if (iframe && src !== prevSrc) {
        // Use setAttribute instead of Svelte to set the `src` HTML attribute, otherwise the iframe
        // `contentWindow.location` is sometimes not updated. For example when setting `logoId`
        // and then reloading the page, the previous logo is shown in the preview.
        iframe.setAttribute('src', src);
        loading = true;
        prevSrc = src;
    }

    /**
     * this method can be used by chart actions to change the
     * preview iframe shown in the publish step
     */
    export function set({ src, width, height, border, scale, transparent }) {
        if (width) customWidth = width;
        if (height) customHeight = height;
        if (border !== undefined) customBorder = border;
        if (src) customSrc = src;
        if (scale) customScale = scale;
        if (transparent !== undefined) customBackground = transparent ? 'transparent' : null;
    }

    /**
     * resets the preview iframe
     */
    export function reset() {
        customWidth = null;
        customHeight = null;
        customSrc = null;
        customBorder = null;
        customScale = null;
    }

    export function getIframeStyle() {
        return {
            width: parseInt(iframe.style.width, 10) || iframe.clientWidth,
            height: parseInt(iframe.style.height, 10) || iframe.clientHeight,
            paddingLeft: parseInt(iframe.style.paddingLeft, 10) || 0,
            paddingRight: parseInt(iframe.style.paddingRight, 10) || 0,
            paddingTop: parseInt(iframe.style.paddingTop, 10) || 0,
            paddingBottom: parseInt(iframe.style.paddingBottom, 10) || 0
        };
    }

    export function getContext(callback) {
        waitFor(
            () => !loading,
            () => {
                callback(contentWindow, contentDocument);
            }
        );
    }

    function onLoad() {
        contentWindow = iframe.contentWindow;
        contentDocument = iframe.contentDocument;
        loading = false;
        dispatch('load');
    }

    function waitFor(test, run, interval = 100) {
        if (!test())
            return setTimeout(() => {
                waitFor(test, run);
            }, interval);
        run();
    }

    function onMessage(e) {
        const message = e.data;
        // TODO: ignore during resizing
        // const { resizing } = this.get();
        // if (resizing) return;
        if (typeof message['datawrapper-height'] !== 'undefined') {
            if (message['datawrapper-height'][$chart.id]) {
                fixedHeight = message['datawrapper-height'][$chart.id];
            }
        }
    }
</script>

<style>
    .iframe-wrapper {
        transform-origin: top center;
    }
    .iframe-wrapper.sticky {
        position: sticky;
        top: 20px;
    }
    .iframe-wrapper.sticky.sticky-header {
        top: 85px;
    }
    .iframe-border {
        box-sizing: content-box;
        padding: 10px;
        margin: 0 auto;
        border: 1px solid #ddd;
    }
    iframe {
        width: 100%;
        height: 100%;
    }
</style>

<svelte:window on:message={onMessage} />

<div
    class="iframe-wrapper"
    class:sticky
    class:sticky-header={$headerProps.isSticky}
    style="transform: scale({scale || 1})"
>
    <div
        class="iframe-border"
        style="background:{background};width:{width}px; height:{height}px;border-color:{borderColor}; padding:{border}px"
    >
        <iframe title={$chart.title} scrolling="no" bind:this={iframe} on:load={onLoad} />
    </div>
</div>
