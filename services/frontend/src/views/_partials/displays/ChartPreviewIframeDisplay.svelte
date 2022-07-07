<script>
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import purifyHtml from '@datawrapper/shared/purifyHtml';
    import get from '@datawrapper/shared/get';
    import sharedSet from '@datawrapper/shared/set';
    import chroma from 'chroma-js';
    import clone from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';
    import unset from 'lodash/unset';
    import isEqual from 'lodash/isEqual';
    import objectDiff from '@datawrapper/shared/objectDiff';
    import { waitFor } from '../../../utils';

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

    /*
     * set to true to activate inline editing of headline, description
     * and other labels
     */
    export let allowInlineEditing = false;

    /*
     * when inline editing is activated we want to make sure that only
     * attributes which are not controlled by external metadata are made
     * inline editable. Therefor `disabledFields` contains a set of
     * disabled attributes
     */
    export let disabledFields = new Set();
    export let dataset = null;

    /*
     * keep track of store subscriptions to we can unsubscribe
     * when this component gets destroyed
     */
    const storeSubscriptions = new Set();

    // default html tags allowed for inline-editing
    const DEFAULT_ALLOWED_HTML = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

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

    export let customWidth;
    export let customHeight;
    let reportedIframeSize;
    export let customSrc;
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

    export async function getContext(callback) {
        await waitFor(() => !loading);
        callback(contentWindow, contentDocument);
    }

    export function reload() {
        getContext(window => {
            loading = true;
            window.location.reload();
        });
    }

    async function onLoad() {
        contentWindow = iframe.contentWindow;
        contentDocument = iframe.contentDocument;
        loading = false;
        dispatch('load');
        await waitForVis();
        if (allowInlineEditing) {
            activateInlineEditing(contentDocument, disabledFields);
        }
    }

    const IGNORE = ['text-annotations', 'range-annotations'];

    export function rerender() {
        getContext((win, doc) => {
            // Re-render chart with new attributes:
            const { metadata: oldMetadata } = win.__dw.vis.chart().get();
            const newMetadata = clone($chart.metadata);
            const visualizeDiff = objectDiff(oldMetadata.visualize, newMetadata.visualize);
            IGNORE.forEach(key => {
                unset(visualizeDiff, key);
            });
            if (
                Object.keys(visualizeDiff).length ||
                !isEqual(oldMetadata.data.changes, newMetadata.data.changes)
            ) {
                win.__dw.vis.chart().set('metadata', newMetadata);
                win.__dw.vis.chart().load(win.__dw.params.data);
                win.__dw.render();
            }
            if (allowInlineEditing) {
                // re-enable inline editing since DOM elements may have
                // been replaced due to re-rendering the vis
                activateInlineEditing(doc, disabledFields);
            }
        });
    }

    function onMessage(event) {
        const message = event.data;
        dispatch('message', message);
        if (resizing) return;
        if (typeof message['datawrapper-height'] !== 'undefined' && fixedHeight) {
            if ($chart && message['datawrapper-height'][$chart.id]) {
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
        updateIsDark(isDark);
    }

    async function waitForVis() {
        await waitFor(
            () => !loading && contentWindow && contentWindow.__dw && contentWindow.__dw.vis
        );
        return contentWindow.__dw.vis.rendered();
    }

    async function updateIsDark(isDark) {
        await waitForVis();
        contentWindow.__dw.vis.darkMode(isDark);
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

    const EDITABLE_FIELDS = [
        {
            key: 'title',
            selector: '.headline-block .block-inner',
            allowedHTML: DEFAULT_ALLOWED_HTML
        },
        {
            key: 'metadata.describe.intro',
            selector: '.description-block .block-inner',
            allowedHTML:
                DEFAULT_ALLOWED_HTML +
                '<summary><details><table><thead><tbody><tfoot><caption><colgroup><col><tr><td><th>',
            multiline: true
        },
        {
            key: 'metadata.annotate.notes',
            selector: '.notes-block .block-inner',
            multiline: true,
            allowedHTML: DEFAULT_ALLOWED_HTML + '<summary><details>'
        },
        {
            key: 'metadata.describe.byline',
            selector: '.byline-block .byline-content',
            allowedHTML: DEFAULT_ALLOWED_HTML
        }
    ];

    function activateInlineEditing(doc, disabledFields) {
        // activate editing for standard fields
        EDITABLE_FIELDS.forEach(({ selector, key, allowedHTML, save, multiline = false }) => {
            if (!disabledFields.has(key)) {
                makeElementEditable({
                    el: doc.querySelector(selector),
                    save: save || getSaveForKey(key),
                    allowedHTML,
                    multiline
                });
            }
        });
        // activate editing for generic visualization labels
        doc.querySelectorAll('.label[data-column][data-row] > span').forEach(label => {
            const parentSpan = label.parentNode;
            const column = parentSpan.getAttribute('data-column');
            // row may also be a comma-separated list of row indices
            const row = parentSpan.getAttribute('data-row').split(',');

            makeElementEditable({
                el: label,
                save(value, prevValue) {
                    if (value !== '' && value !== prevValue) {
                        const transpose = $chart.metadata.data.transpose;
                        const c = !transpose ? dataset.indexOf(column) : 0;
                        const r = row.map(row => (!transpose ? +row + 1 : dataset.indexOf(column)));
                        const changes = clone($chart.metadata.data.changes || []);
                        r.forEach(function (r) {
                            changes.push({
                                row: r,
                                column: c,
                                value,
                                time: Date.now(),
                                previous: prevValue
                            });
                        });
                        $chart.metadata.data.changes = changes;
                    }
                }
            });
        });

        function getSaveForKey(key) {
            return function (value, prevValue) {
                if (value !== prevValue) {
                    sharedSet($chart, key, value);
                    $chart = $chart;
                }
            };
        }

        function makeElementEditable({
            el,
            save,
            allowedHTML = DEFAULT_ALLOWED_HTML,
            multiline = false
        }) {
            if (!el) return;
            let lastValue = false;

            el.setAttribute('contenteditable', true);

            // Save old value for ESC key:
            el.addEventListener('focus', () => {
                lastValue = el.innerHTML;
            });

            el.addEventListener('keydown', evt => {
                // Revert last value when ESC is hit:
                if (evt.keyCode === 27) {
                    evt.preventDefault();
                    el.innerHTML = lastValue;
                    el.blur();
                }
                // blur and save on Return
                if (!multiline && evt.keyCode === 13) {
                    evt.preventDefault();
                    el.blur();
                }
            });

            // Persist changes when edited element loses focus:
            el.addEventListener('blur', () => {
                // Remove trailing line breaks
                const content = el.innerHTML.trim().replace(/<br ?\/?>$/i, '');
                save(purifyHtml(content, allowedHTML), lastValue);
            });
        }
    }

    onMount(async () => {
        if (allowInlineEditing) {
            // watch chart store for changes that make an
            // inline editable DOM element appear that wasn't
            // showing before, e.g. when user enters a byline
            const prevState = Object.fromEntries(
                EDITABLE_FIELDS.map(({ key }) => [key, !!get($chart, key)])
            );
            const activateInlineEditingDebounced = debounce(async () => {
                await waitForVis();
                activateInlineEditing(contentDocument, disabledFields);
            }, 500);
            EDITABLE_FIELDS.forEach(({ key }) => {
                storeSubscriptions.add(
                    chart.subscribeKey(key, value => {
                        if (value && !prevState[key]) {
                            // re-activate inline editing to make newly
                            // appeared DOM element editable, too
                            activateInlineEditingDebounced();
                        }
                        prevState[key] = !!value;
                    })
                );
            });
        }
    });

    onDestroy(() => {
        for (const unsubscribe of storeSubscriptions) {
            unsubscribe();
        }
    });
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
            title={get($chart, 'title', '')}
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
