<script>
    // displays
    import ChartPreviewIframeDisplay from '_partials/displays/ChartPreviewIframeDisplay.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    // editor
    import ColorblindCheck from '_partials/editor/ColorblindCheck.svelte';
    import DarkModeToggle from '_partials/editor/DarkModeToggle.svelte';
    import PreviewResizer from '_partials/editor/PreviewResizer.svelte';
    import Toolbar from '_partials/editor/Toolbar.svelte';
    import ToolbarArea from '_partials/editor/ToolbarArea.svelte';
    // other Svelte
    import ViewComponent from '_partials/ViewComponent.svelte';
    import Tabs from '_partials/Tabs.svelte';
    import AnnotateTab from './visualize/AnnotateTab.svelte';
    import ChartTypeTab from './visualize/ChartTypeTab.svelte';
    import LayoutTab from './visualize/LayoutTab.svelte';
    import RefineTab from './visualize/RefineTab.svelte';
    // other JS
    import clone from 'lodash/cloneDeep';
    import { onMount, getContext, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    import { headerProps } from '_layout/stores';
    import get from '@datawrapper/shared/get';
    // load stores from context
    const { chart, theme, visualization, isDark, customViews, dataset, editorMode, isFixedHeight } =
        getContext('page/edit');

    export let __;
    export let dwChart;
    export let visualizations;
    export let workflow;
    export let teamSettings;
    export let disabledFields;
    export let layoutControlsGroups;
    /**
     * all themes available to authenticated user
     */
    export let themes;

    let iframePreview;

    const tabs = [
        ...(workflow.options.hideChartTypeSelector
            ? []
            : [{ id: 'select-vis', title: __('Chart type'), ui: ChartTypeTab }]),
        { id: 'refine', title: __('Refine'), ui: RefineTab },
        { id: 'annotate', title: __('Annotate'), ui: AnnotateTab },
        { id: 'layout', title: __('Layout'), ui: LayoutTab }
    ];

    // id of the initially active tab
    let active =
        !get($chart, 'metadata.visualize.chart-type-set', false) &&
        !workflow.options.hideChartTypeSelector
            ? 'select-vis'
            : 'refine';
    let prevActive;
    $: activeTab = tabs.find(d => d.id === active) || tabs[0];

    let scrollY = 0;
    let innerHeight = 0;
    let innerWidth = 0;

    $: isSticky = innerHeight > 600 && innerWidth > 1200;

    function onPreviewResize(event) {
        dwChart.set('metadata.publish.embed-width', event.detail.width);
        const reset = { width: null };
        if (event.detail.height) {
            reset.height = null;
            dwChart.set('metadata.publish.embed-height', event.detail.height);
        }
        iframePreview.set(reset);
    }

    let messages = [];
    function onPreviewMessage(event) {
        const { type, data } = event.detail;
        if (type === 'editor:notification:show') {
            messages = [...messages, data];
        }
        if (type === 'editor:notification:hide') {
            messages = messages.filter(({ id }) => id !== data.id);
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
        'metadata.axes'
    ];
    function reloadPreview() {
        dwChart.onNextSave(() => {
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

    /*
     * keep track of store subscriptions to we can unsubscribe
     * when this component gets destroyed
     */
    const storeSubscriptions = new Set();

    onMount(() => {
        RELOAD.forEach(key => storeSubscriptions.add(chart.subscribeKey(key, reloadPreview)));
        UPDATE.forEach(key => storeSubscriptions.add(chart.subscribeKey(key, updatePreview)));
        RERENDER.forEach(key =>
            storeSubscriptions.add(chart.subscribeKey(key, iframePreview.rerender))
        );
        // read current tab from url hash
        if (tabs.find(t => `#${t.id}` === window.location.hash)) {
            active = prevActive = window.location.hash.substring(1);
        } else {
            window.location.hash = `#${active}`;
            prevActive = active;
        }
        // preload the annotate tab, so that inline editing of annotations always works
        tabLoaded.annotate = true;
    });

    $: {
        // store current tab in url hash
        if (prevActive && active !== prevActive) {
            window.location.hash = `#${active}`;
            prevActive = active;
        }
    }

    /**
     * remember which tabs we've opened already to keep them
     * in DOM, but without having to load them all at once
     */
    let tabLoaded = {};
    $: {
        if (prevActive) tabLoaded = { ...tabLoaded, [prevActive]: true };
    }

    function changeTabBy(offset) {
        const curTabIndex = tabs.indexOf(activeTab);
        if (curTabIndex > -1) {
            if (tabs[curTabIndex + offset]) {
                // switch active tab
                active = tabs[curTabIndex + offset].id;
            } else {
                // redirect to prev/next workflow step
                const curStep = window.location.pathname.split('/').at(-1);
                const curStepIndex = workflow.steps.findIndex(step => step.id === curStep);
                if (
                    (offset < 0 && curStepIndex > 0) ||
                    (offset > 0 && curStepIndex < workflow.steps.length - 1)
                ) {
                    window.location.href = workflow.steps[curStepIndex + Math.sign(offset)].id;
                }
            }
        }
    }

    function measureBodyHeight() {
        iframePreview.getContext((contentWindow, contentDocument) => {
            const chartBody = contentDocument.querySelector('.dw-chart-body');
            if (chartBody && chartBody.getBoundingClientRect) {
                const chartBodyHeight = chartBody.getBoundingClientRect().height;
                $chart.metadata.publish['chart-height'] = Math.ceil(chartBodyHeight);
            }
        });
    }

    onDestroy(() => {
        for (const unsubscribe of storeSubscriptions) {
            unsubscribe();
        }
    });
</script>

<style lang="scss">
    @import '../../../styles/export.scss';
    .preview.sticky {
        position: sticky;
        top: 20px;
    }
    .preview.sticky.sticky-header {
        top: 85px;
    }

    .limit-width {
        max-width: calc(100vw - (2 * $gap));
        overflow-x: auto;
        overflow-y: clip;
        height: auto;
    }
    @include tablet {
        .limit-width {
            max-width: calc(66.6vw - (2 * $gap));
        }
    }
    @include widescreen {
        .limit-width {
            max-width: calc(($widescreen - (2 * $gap)) * 0.66);
        }
    }
</style>

<svelte:window bind:innerHeight bind:innerWidth bind:scrollY />

<div class="container">
    <div class="columns">
        <div class="column is-one-third">
            <div class="vis-controls block">
                <Tabs items={tabs} bind:active />
            </div>
            {#each tabs as tab}
                {#if tab === activeTab || tabLoaded[tab.id]}
                    <div class="block" class:is-hidden={tab !== activeTab}>
                        <svelte:component
                            this={tab.ui}
                            {__}
                            {themes}
                            {dwChart}
                            {workflow}
                            {visualizations}
                            {teamSettings}
                            {disabledFields}
                            {layoutControlsGroups}
                        />
                    </div>
                {/if}
            {/each}

            <div class="buttons">
                <button class="button" on:click={() => changeTabBy(-1)}
                    ><IconDisplay icon="arrow-left" /><span>{__('Back')}</span></button
                >
                <button class="button is-primary" on:click={() => changeTabBy(+1)}>
                    <span>{__('Proceed')}</span>
                    <IconDisplay icon="arrow-right" />
                </button>
            </div>
        </div>
        <div class="column">
            <div
                class="preview"
                class:sticky={isSticky}
                class:sticky-header={$headerProps.isSticky}
            >
                <div class="block limit-width">
                    <ChartPreviewIframeDisplay
                        bind:this={iframePreview}
                        {chart}
                        fixedHeight={$isFixedHeight}
                        enforceFitHeight={$editorMode === 'print' &&
                            $visualization.supportsFitHeight}
                        isDark={$isDark}
                        on:resize={onPreviewResize}
                        resizable={$editorMode === 'web'}
                        on:message={onPreviewMessage}
                        allowInlineEditing
                        {disabledFields}
                        theme={$theme}
                        dataset={$dataset}
                        on:render={measureBodyHeight}
                    />
                </div>

                {#each messages as message}
                    <div
                        class="block is-flex is-justify-content-center"
                        transition:fade={{ duration: 300 }}
                    >
                        <MessageDisplay
                            deletable={message.deletable}
                            title={message.title}
                            type={message.type || 'info'}
                            visible
                        >
                            {#if message.pending}
                                <IconDisplay
                                    icon="loading-spinner"
                                    size="20px"
                                    className="mr-1"
                                    valign="middle"
                                    timing="steps(12)"
                                    duration="1s"
                                    spin
                                />
                            {/if}
                            {__(message.translateKey)}
                        </MessageDisplay>
                    </div>
                {/each}

                <div class="block mt-5 pt-2">
                    <Toolbar>
                        {#if customViews && customViews.visualizeToolbarPrepend && customViews.visualizeToolbarPrepend.length > 0}
                            {#each customViews.visualizeToolbarPrepend as comp}
                                <ViewComponent id={comp.id} {__} props={{ ...comp.props }} />
                            {/each}
                        {/if}

                        <ToolbarArea title={__('edit / preview')}>
                            <PreviewResizer {__} {iframePreview} />
                            <ColorblindCheck iframe={iframePreview} {__} />
                            <DarkModeToggle {__} on:change-tab={evt => (active = evt.detail)} />
                        </ToolbarArea>
                    </Toolbar>
                </div>
            </div>
        </div>
    </div>
</div>
