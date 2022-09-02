<script>
    import clone from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';
    import unset from 'lodash/unset';
    import isEqual from 'lodash/isEqual';
    import objectDiff from '@datawrapper/shared/objectDiff';
    import purifyHtml from '@datawrapper/shared/purifyHtml';
    import sharedSet from '@datawrapper/shared/set';
    import get from '@datawrapper/shared/get';
    import { merge } from 'rxjs';
    import { debounceTime, tap } from 'rxjs/operators';
    import { getContext, onMount, onDestroy } from 'svelte';

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

    /*
     * keep track of store subscriptions so we can unsubscribe when this component gets destroyed
     */
    const storeSubscriptions = new Set();

    let iframePreview;

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

    // default html tags allowed for inline-editing
    const DEFAULT_ALLOWED_HTML = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

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
        'metadata.axes'
    ];
    function reloadPreview() {
        onNextSave.add(() => {
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
    const RERENDER = ['metadata.visualize', 'metadata.data.changes'];

    onMount(async () => {
        storeSubscriptions.add(
            merge(...RELOAD.map(key => chart.bindKey(key)))
                .pipe(
                    debounceTime(100),
                    tap(() => reloadPreview())
                )
                .subscribe()
        );
        storeSubscriptions.add(
            merge(...UPDATE.map(key => chart.bindKey(key)))
                .pipe(
                    debounceTime(100),
                    tap(() => updatePreview())
                )
                .subscribe()
        );
        storeSubscriptions.add(
            merge(...RERENDER.map(key => chart.bindKey(key)))
                .pipe(
                    debounceTime(100),
                    tap(() => rerender())
                )
                .subscribe()
        );
        storeSubscriptions.add(data.subscribe(() => rerender(true)));

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
        if (allowInlineEditing) {
            iframePreview.getContext((contentWindow, contentDocument) => {
                activateInlineEditing(contentDocument, $readonlyKeys);
            });
        }
    }

    const IGNORE = ['text-annotations', 'range-annotations'];

    export async function rerender(force = false) {
        await iframePreview.waitForVis();
        iframePreview.getContext(async (win, doc) => {
            // Re-render chart with new attributes:
            const { metadata: oldMetadata } = win.__dw.vis.chart().get();
            const newMetadata = clone($chart.metadata);
            const visualizeDiff = objectDiff(oldMetadata.visualize, newMetadata.visualize);

            // keep preview state in sync...
            win.__dw.vis.chart().set('metadata', newMetadata);
            await win.__dw.vis.chart().load($data || win.__dw.params.data);

            // When a chart can not be edited the annotations need to updated manually.
            // This is the case in the publish step.
            if (allowInlineEditing) {
                IGNORE.forEach(key => {
                    unset(visualizeDiff, key);
                });
            }

            if (
                Object.keys(visualizeDiff).length ||
                !isEqual(oldMetadata.data.changes, newMetadata.data.changes) ||
                force
            ) {
                // ...but only re-render if necessary
                win.__dw.render();
            }
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
    theme={$theme}
    on:message
    on:load={onLoad}
    on:render
    on:resize
/>
