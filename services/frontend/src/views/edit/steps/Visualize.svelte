<script>
    import ChartPreviewIframeDisplay from '_partials/displays/ChartPreviewIframeDisplay.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import Tabs from '_partials/Tabs.svelte';
    import AnnotateTab from './visualize/AnnotateTab.svelte';
    import ChartTypeTab from './visualize/ChartTypeTab.svelte';
    import DesignTab from './visualize/DesignTab.svelte';
    import RefineTab from './visualize/RefineTab.svelte';
    import clone from 'lodash/cloneDeep';
    import { onMount } from 'svelte';
    import { chart, visualization, subscribeChart } from '../stores';
    import { headerProps } from '_layout/stores';

    export let __;
    export let dwChart;
    export let theme;
    export let data;
    export let visualizations;
    export let workflow;
    export let teamSettings;
    export let disabledFields;

    let iframePreview;

    const tabs = [
        ...(workflow.options.hideChartTypeSelector
            ? []
            : [{ id: 'select-vis', title: __('Chart type'), ui: ChartTypeTab }]),
        { id: 'refine', title: __('Refine'), ui: RefineTab },
        { id: 'annotate', title: __('Annotate'), ui: AnnotateTab },
        { id: 'layout', title: __('Layout'), ui: DesignTab }
    ];

    // id of the initially active tab
    let active = 'refine';
    let prevActive;
    $: activeTab = tabs.find(d => d.id === active) || tabs[0];

    let scrollY = 0;
    let innerHeight = 0;
    let innerWidth = 0;

    $: isSticky = innerHeight > 600 && innerWidth > 1200;

    function onPreviewResize(event) {
        // todo: store size elsewhere in print mode
        dwChart.set('metadata.publish.embed-width', event.detail.width);
        if (event.detail.height) {
            dwChart.set('metadata.publish.embed-height', event.detail.height);
        }
    }

    /*
     * some changes require a full reload of the iframe
     */
    const RELOAD = ['type', 'theme', 'language', 'metadata.data.transpose', 'metadata.axes'];
    function reloadPreview() {
        dwChart.onNextSave(() => {
            iframePreview.reset();
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
    function rerenderPreview() {
        iframePreview.getContext(win => {
            // Re-render chart with new attributes:
            win.__dw.vis.chart().set('metadata', clone($chart.metadata));
            win.__dw.vis.chart().load(win.__dw.params.data);
            win.__dw.render();
        });
    }

    onMount(() => {
        RELOAD.forEach(key => subscribeChart(key, reloadPreview));
        UPDATE.forEach(key => subscribeChart(key, updatePreview));
        subscribeChart('metadata.visualize', rerenderPreview);
        // read current tab from url hash
        if (tabs.find(t => `#${t.id}` === window.location.hash)) {
            active = prevActive = window.location.hash.substring(1);
        } else {
            window.location.hash = `#${active}`;
            prevActive = active;
        }
    });

    $: {
        // store current tab in url hash
        if (prevActive && active !== prevActive) {
            window.location.hash = `#${active}`;
            prevActive = active;
        }
    }

    function changeTab(offset) {
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
</script>

<style>
    .preview.sticky {
        position: sticky;
        top: 20px;
    }
    .preview.sticky.sticky-header {
        top: 85px;
    }
</style>

<svelte:window bind:innerHeight bind:innerWidth bind:scrollY />

<div class="container">
    <div class="columns">
        <div class="column is-one-third">
            <div class="vis-controls block">
                <Tabs items={tabs} bind:active />
            </div>
            <div class="block">
                <svelte:component
                    this={activeTab.ui}
                    {__}
                    {data}
                    {chart}
                    {theme}
                    {dwChart}
                    {subscribeChart}
                    {workflow}
                    {visualization}
                    {visualizations}
                    {teamSettings}
                    {disabledFields}
                />
            </div>
            <div class="buttons are-small">
                <button class="button" on:click={() => changeTab(-1)}
                    ><IconDisplay icon="arrow-left" /><span>Back</span></button
                >
                <button class="button is-primary" on:click={() => changeTab(+1)}>
                    <span>Proceed</span>
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
                <ChartPreviewIframeDisplay
                    resizable
                    fixedHeight={$visualization.height === 'fixed'}
                    on:resize={onPreviewResize}
                    bind:this={iframePreview}
                    {chart}
                    {theme}
                />
                <div class="block mt-4" style="text-align: center;">
                    - - - - - Some more controls - - - - -<br />x x x x x x
                </div>
            </div>
        </div>
    </div>
</div>
