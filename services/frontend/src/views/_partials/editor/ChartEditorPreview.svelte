<script>
    import clone from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';
    import unset from 'lodash/unset';
    import objectDiff from '@datawrapper/shared/objectDiff.js';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import sharedSet from '@datawrapper/shared/set.js';
    import get from '@datawrapper/shared/get.js';
    import { merge } from 'rxjs';
    import { debounceTime, pairwise, skip, tap, map, filter } from 'rxjs/operators';
    import { getContext, onMount, onDestroy, createEventDispatcher } from 'svelte';

    import ChartPreviewIframeDisplay from '_partials/displays/ChartPreviewIframeDisplay.svelte';

    const {
        chart,
        data,
        dataset,
        editorMode,
        isDark,
        isFixedHeight,
        onNextSave,
        theme,
        visualization,
        readonlyKeys
    } = getContext('page/edit');

    export let previewWidth;

    /*
     * set to true to activate inline editing of headline, description
     * and other labels
     */
    export let allowInlineEditing = false;
    export let allowResizing = false;
    export let previewId = null;

    /*
     * keep track of store subscriptions so we can unsubscribe when this component gets destroyed
     */
    const storeSubscriptions = new Set();
    const dispatch = createEventDispatcher();

    /*
     * allows editors to ignore additiona metadata props so that we're not triggering
     * re-rendering of the preview
     */
    export let ignoreVisualizeMetadataProps = [];

    let iframePreview;

    // default html tags allowed for inline-editing
    const DEFAULT_ALLOWED_HTML = [
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
        'tt'
    ];

    const EDITABLE_FIELDS = [
        {
            key: 'title',
            selector: '.headline-block .block-inner',
            allowedHTML: DEFAULT_ALLOWED_HTML
        },
        {
            key: 'metadata.describe.intro',
            selector: '.description-block .block-inner',
            allowedHTML: [
                ...DEFAULT_ALLOWED_HTML,
                ...[
                    'summary',
                    'details',
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
                ]
            ],
            multiline: true
        },
        {
            key: 'metadata.annotate.notes',
            selector: '.notes-block .block-inner',
            multiline: true,
            allowedHTML: [].concat(DEFAULT_ALLOWED_HTML, ['summary', 'details'])
        },
        {
            key: 'metadata.describe.byline',
            selector: '.byline-block .byline-content',
            allowedHTML: DEFAULT_ALLOWED_HTML
        }
    ];

    function activateInlineEditing(doc, readonlyKeys) {
        // activate editing for standard fields
        EDITABLE_FIELDS.forEach(({ selector, key, allowedHTML, save, multiline = false }) => {
            if (!readonlyKeys.has(key)) {
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
                        const c = !transpose ? $dataset.indexOf(column) : 0;
                        const r = row.map(row =>
                            !transpose ? +row + 1 : $dataset.indexOf(column)
                        );
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

    /*
     * some changes require a full reload of the iframe
     */
    const RELOAD = [
        'type',
        'theme',
        'language',
        'metadata.data.transpose',
        'metadata.data.column-order',
        'metadata.data.column-format',
        'metadata.describe.computed-columns',
        'metadata.axes',
        'metadata.visualize.basemap',
        'metadata.visualize.basemapProjection',
        'metadata.visualize.basemapRegions',
        'metadata.visualize.layers'
    ];
    function reloadPreview() {
        onNextSave(() => {
            iframePreview.reload();
        });
    }

    /*
     * some changes require updating the state of the chart-core
     * Visualization.svelte component inside the preview iframe
     */
    const UPDATE = [
        'title',
        'metadata.describe',
        'metadata.annotate.notes',
        'metadata.custom',
        'metadata.publish.blocks',
        'metadata.publish.force-attribution',
        'metadata.visualize.sharing'
    ];
    function updatePreview() {
        iframePreview.getContext(win => {
            win.__dwUpdate({ chart: clone($chart) });
        });
    }

    /*
     * some changes require a re-rendering of the visualization
     * since we don't want to wait for the server roundtrip
     * we inject the new metadata before re-rendering
     */
    const RERENDER = ['metadata.data.changes'];

    /*
     * we never want to trigger re-rendering when any of these basemap related
     * props change. Instead we reload the preview.
     */
    const IGNORED_BASEMAP_PROPS = [
        'basemap',
        'basemapFilename',
        'basemapProjection',
        'basemapRegions',
        'basemapShowExtraOptions',
        'layers'
    ];

    // Emits whenever a property in metadata.visualize changes
    // When in edit mode, certain metadata changes don't require a re-render.
    const visMetadataChanges$ = chart.bindKey('metadata.visualize').pipe(
        pairwise(),
        map(([prev, cur]) => objectDiff(prev, cur)),
        map(visDiff => {
            if (allowInlineEditing) {
                ignoreVisualizeMetadataProps.forEach(key => {
                    unset(visDiff, key);
                });
            }
            IGNORED_BASEMAP_PROPS.forEach(key => {
                unset(visDiff, key);
            });
            return visDiff;
        }),
        filter(visDiff => Object.keys(visDiff).length)
    );

    onMount(async () => {
        storeSubscriptions.add(
            merge(...RELOAD.map(key => chart.bindKey(key)))
                .pipe(debounceTime(100), skip(1), tap(reloadPreview))
                .subscribe()
        );
        storeSubscriptions.add(
            merge(...UPDATE.map(key => chart.bindKey(key)))
                .pipe(debounceTime(100), tap(updatePreview))
                .subscribe()
        );
        storeSubscriptions.add(
            merge(...RERENDER.map(key => chart.bindKey(key)), visMetadataChanges$, data)
                .pipe(
                    debounceTime(100),
                    tap(() => rerender())
                )
                .subscribe()
        );

        if (allowInlineEditing) {
            // watch chart store for changes that make an
            // inline editable DOM element appear that wasn't
            // showing before, e.g. when user enters a byline
            const prevState = Object.fromEntries(
                EDITABLE_FIELDS.map(({ key }) => [key, !!get($chart, key)])
            );
            const activateInlineEditingDebounced = debounce(async () => {
                await iframePreview.waitForVis();
                iframePreview.getContext((contentWindow, contentDocument) => {
                    activateInlineEditing(contentDocument, $readonlyKeys);
                });
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
        for (const subscription of storeSubscriptions) {
            if (subscription.unsubscribe) {
                subscription.unsubscribe(); // rxjs observable
            } else {
                subscription();
            }
        }
    });

    function onLoad() {
        dispatch('load');
        if (allowInlineEditing) {
            iframePreview.getContext((contentWindow, contentDocument) => {
                activateInlineEditing(contentDocument, $readonlyKeys);
            });
        }
    }

    export async function rerender() {
        await iframePreview.waitForVis();
        iframePreview.getContext(async (win, doc) => {
            // Re-render chart with new attributes:
            const newMetadata = clone($chart.metadata);

            // keep preview state in sync...
            win.__dw.vis.chart().set('metadata', newMetadata);
            await win.__dw.vis.chart().load($data || win.__dw.params.data);

            // re-render
            win.__dw.render();

            if (allowInlineEditing) {
                // re-enable inline editing since DOM elements may have
                // been replaced due to re-rendering the vis
                activateInlineEditing(doc, $readonlyKeys);
            }
        });
    }

    export function set() {
        return iframePreview.set.apply(iframePreview, arguments);
    }

    export function reset() {
        return iframePreview.reset.apply(iframePreview, arguments);
    }

    export function getIframeStyle() {
        return iframePreview.getIframeStyle.apply(iframePreview, arguments);
    }

    export function updateHeight() {
        return iframePreview.updateHeight.apply(iframePreview, arguments);
    }

    function iframeGetContext() {
        return iframePreview.getContext.apply(iframePreview, arguments);
    }

    export { iframeGetContext as getContext };
</script>

<ChartPreviewIframeDisplay
    bind:this={iframePreview}
    bind:previewWidth
    chart={$chart}
    enforceFitHeight={$editorMode === 'print' && $visualization.supportsFitHeight}
    fixedHeight={$isFixedHeight}
    isDark={$isDark}
    resizable={allowResizing && $editorMode === 'web'}
    {allowInlineEditing}
    {previewId}
    theme={$theme}
    on:message
    on:load={onLoad}
    on:render
    on:resize
/>
