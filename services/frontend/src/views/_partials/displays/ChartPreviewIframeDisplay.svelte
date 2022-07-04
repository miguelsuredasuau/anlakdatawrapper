<script>
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import get from '@datawrapper/shared/get';
    import chroma from 'chroma-js';

    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import LoadingSpinnerDisplay from '_partials/displays/LoadingSpinnerDisplay.svelte';

    const dispatch = createEventDispatcher();

    /*
     * writable chart store
     */
    export let chart;

    /*
     * theme object
     */
    export let theme;

    /*
     * make preview resizable. resizing will
     * dispatch `resize` event with new size
     */
    export let resizable = false;

    /*
     * set to true if visualization is fixed height
     */
    export let fixedHeight = false;

    export let isDark = false;

    $: width = customWidth || get($chart, 'metadata.publish.embed-width', 550);
    $: height =
        customHeight || reportedIframeSize || get($chart, 'metadata.publish.embed-height', 450);
    $: background =
        customBackground || get(theme, `_computed.${isDark ? 'bgDark' : 'bgLight'}`, 'white');
    $: borderColor = chroma.valid(background) ? chroma(background).darken(0.7) : background;
    $: border = customBorder === null ? 10 : customBorder;
    $: scale = customScale || 1;

    $: backgroundIsDark = chroma.valid(background) ? chroma(background).get('lab.l') < 30 : false;

    $: src = customSrc || `/preview/${$chart.id}`;
    let prevSrc;

    let customWidth;
    let customHeight;
    let reportedIframeSize;
    let customSrc;
    let customBorder = null;
    let customScale;
    let customBackground;

    let resizeWidth;
    let resizeHeight;

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
        if (width !== undefined) customWidth = width;
        if (height !== undefined) customHeight = height;
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

    export function reload() {
        getContext(window => {
            loading = true;
            window.location.reload();
        });
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
        if (resizing) return;
        if (typeof message['datawrapper-height'] !== 'undefined' && fixedHeight) {
            if (message['datawrapper-height'][$chart.id]) {
                reportedIframeSize = message['datawrapper-height'][$chart.id];
            }
        }
    }

    $: {
        if (!fixedHeight) {
            reportedIframeSize = undefined;
        }
    }

    $: {
        // update preview if isDark changes
        waitFor(
            () => !loading && contentWindow && contentWindow.__dw && contentWindow.__dw.vis,
            () => {
                contentWindow.__dw.vis.darkMode(isDark);
            }
        );
    }

    let resizing = false;
    let resizeOrigMousePos;

    function startResize(event) {
        resizing = true;
        resizeOrigMousePos = [event.pageX, event.pageY];
    }

    function resize(event) {
        if (resizing) {
            const diffX = event.pageX - resizeOrigMousePos[0];
            resizeWidth = width + diffX * 2; // x2 because the preview is horizontically centered
            if (!fixedHeight) {
                const diffY = event.pageY - resizeOrigMousePos[1];
                resizeHeight = height + diffY;
            }
        }
    }

    function stopResize() {
        if (resizing) {
            customWidth = resizeWidth;
            resizeWidth = undefined;
            resizeOrigMousePos = undefined;

            if (!fixedHeight) {
                customHeight = resizeHeight;
                resizeHeight = undefined;
            }

            dispatch('resize', {
                width: customWidth,
                height: fixedHeight ? reportedIframeSize : customHeight
            });
            resizing = false;
        }
    }
</script>

<style>
    .iframe-wrapper {
        transform-origin: top center;
    }

    .iframe-border {
        box-sizing: content-box;
        padding: 10px;
        margin: 0 auto;
        border: 1px solid #ddd;
        position: relative;
    }
    .iframe-border.resizing * {
        pointer-events: none;
    }

    iframe {
        width: 100%;
        height: 100%;
    }
    .resizer {
        position: absolute;
        right: 0;
        bottom: 0;
        cursor: se-resize;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        padding: 0.25em;
        color: var(--color-dw-grey);
        background-color: rgba(0, 0, 0, 0.05);
        color: #666;
    }
    .resizer:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
    .dark-background .resizer {
        color: var(--color-dw-grey-lighter);
        background-color: rgba(255, 255, 255, 0.1);
    }
    .dark-background .resizer:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }
    .fixed-height .resizer {
        cursor: ew-resize;
    }
    .is-loading {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: #f3f3f3;
        opacity: 0.95;
    }
    .is-loading > div {
        display: block;
        color: #999;
        position: absolute;
        top: 50%;
        right: 0;
        bottom: 0;
        font-size: 20px;
        left: 0;
        text-align: center;
        line-height: 0;
    }
</style>

<svelte:window on:message={onMessage} on:mousemove={resize} on:mouseup={stopResize} />

<div
    class="iframe-wrapper"
    style="transform: scale({scale || 1})"
    class:dark-background={backgroundIsDark}
>
    <div
        class="iframe-border"
        class:resizing
        class:fixed-height={fixedHeight}
        style="background:{background};width:{resizeWidth || width}px; height:{resizeHeight ||
            height}px;border-color:{borderColor}; padding:{border}px"
    >
        <iframe
            id="iframe-vis"
            title={$chart.title}
            {src}
            scrolling="no"
            bind:this={iframe}
            on:load={onLoad}
        />
        {#if resizable}
            <div class="resizer" on:mousedown={startResize}>
                <IconDisplay icon="resize-{fixedHeight ? 'horizontal' : 'diagonal'}" />
            </div>
        {/if}
        {#if loading}
            <div class="is-loading" transition:fade={{ duration: 150 }}>
                <div><span>loading</span> <LoadingSpinnerDisplay /></div>
            </div>
        {/if}
    </div>
</div>
