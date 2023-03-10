<script>
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import get from '@datawrapper/shared/get.js';
    import chroma from 'chroma-js';
    import { waitFor } from '../../../utils';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import LoadingSpinnerDisplay from '_partials/displays/LoadingSpinnerDisplay.svelte';

    const dispatch = createEventDispatcher();

    /*
     * readonly chart store data
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
    export let enforceFitHeight = false;

    export let isDark = false;

    export let allowInlineEditing = false;

    export let previewId = null;

    $: embedWidth = get(chart, 'metadata.publish.embed-width', 550);
    $: embedHeight = get(chart, 'metadata.publish.embed-height', 450);
    $: width = customWidth || embedWidth;
    $: height = customHeight || reportedIframeSize || embedHeight;
    $: background =
        customBackground || get(theme, `_computed.${isDark ? 'bgDark' : 'bgLight'}`, 'white');
    $: borderColor = chroma.valid(background) ? chroma(background).darken(0.7) : background;
    $: border = customBorder === null ? 10 : customBorder;
    $: scale = customScale || 1;

    $: backgroundIsDark = chroma.valid(background) ? chroma(background).get('lab.l') < 30 : false;

    const queryParameters = new URLSearchParams();
    $: {
        enforceFitHeight
            ? queryParameters.set('fitchart', '1')
            : queryParameters.delete('fitchart');
        allowInlineEditing
            ? queryParameters.set('allowEditing', '1')
            : queryParameters.delete('allowEditing');
        previewId
            ? queryParameters.set('previewId', previewId)
            : queryParameters.delete('previewId');
    }

    $: src = customSrc || `/preview/${chart.id}${queryParameters ? `?${queryParameters}` : ''}`;
    let prevSrc;

    export let customWidth;
    export let customHeight;
    let reportedIframeSize;
    export let customSrc;
    let customBorder = null;
    let customScale;
    let customBackground;

    let resizeWidth;
    let resizeHeight;

    /**
     * readonly export of the current width of the iframe
     */
    export let previewWidth;
    $: previewWidth = (2 + border * 2 + (resizeWidth || width)) * scale;
    $: previewHeight = (2 + border * 2 + (resizeHeight || height)) * scale;

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

    export async function getContext(callback) {
        try {
            await waitFor(() => !loading);
            if (callback) callback(contentWindow, contentDocument);
            else return { contentWindow, contentDocument };
        } catch (e) {
            // ignore waitFor timeouts
            if (e.message !== 'waitFor timeout exceeded') throw e;
        }
    }

    export function reload() {
        getContext(window => {
            loading = true;
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        });
    }

    async function onLoad() {
        contentWindow = iframe.contentWindow;
        contentDocument = iframe.contentDocument;
        loading = false;
        dispatch('load');
        updateIsDark(isDark);
    }

    function onMessage(event) {
        const message = event.data;
        dispatch('message', message);
        if (message === 'datawrapper:vis:rendered') dispatch('render');
        if (resizing) return;
        if (typeof message['datawrapper-height'] !== 'undefined' && fixedHeight) {
            if (previewId && message['datawrapper-height'].previewId !== previewId) {
                // message coming from a different preview iframe
                return;
            }
            if (chart && message['datawrapper-height'][chart.id]) {
                reportedIframeSize = message['datawrapper-height'][chart.id];
                dispatch('resize', {
                    fixedHeight: true,
                    width: width,
                    height: reportedIframeSize
                });
            }
        }
    }

    /**
     * measure the height of the rendered chart and
     * update the iframe height in case the visualization
     * is fixed height
     *
     * @returns {number} the measured height
     */
    export async function updateHeight() {
        const { contentDocument } = await getContext();
        if (fixedHeight) {
            reportedIframeSize = contentDocument.body.clientHeight;
        }
        return contentDocument.body.clientHeight;
    }

    $: {
        if (!fixedHeight) {
            reportedIframeSize = undefined;
        }
    }

    $: {
        // update preview if isDark changes
        if (typeof window !== 'undefined') updateIsDark(isDark);
    }

    export async function waitForVis() {
        await waitFor(
            () => !loading && contentWindow && contentWindow.__dw && contentWindow.__dw.vis,
            { timeout: 60000 }
        );
        return contentWindow.__dw.vis.rendered();
    }

    async function updateIsDark(isDark) {
        try {
            await waitForVis();
            contentWindow.__dw.vis.darkMode(isDark);
            contentWindow.__dwUpdate({ isStyleDark: isDark });
        } catch (e) {
            // ignore waitFor timeouts
            if (e.message !== 'waitFor timeout exceeded') throw e;
        }
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
        transform-origin: top left;
    }

    .iframe-border {
        box-sizing: content-box;
        padding: 10px;
        margin: 0 auto;
        border: 1px solid #ddd;
        position: relative;
    }
    .iframe-border.resizing > :not(.resizer) {
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
        cursor: nwse-resize;
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
    style="transform: scale({scale || 1}); height: {previewHeight}px"
    class:dark-background={backgroundIsDark}
>
    <div
        class="iframe-border"
        class:resizing
        class:fixed-height={fixedHeight}
        style="background:{background};width:{resizeWidth || width}px; height:{resizeHeight ||
            height}px;border-color:{borderColor}; padding:{border}px; padding-bottom:{Math.max(
            border - (allowInlineEditing ? 10 : 0),
            0
        )}px"
    >
        <iframe
            id="iframe-vis"
            title={get(chart, 'title', '')}
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
