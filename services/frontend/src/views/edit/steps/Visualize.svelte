<script>
    import ChartPreviewIframeDisplay from '_partials/displays/ChartPreviewIframeDisplay.svelte';
    import Tabs from '_partials/Tabs.svelte';
    import AnnotateTab from './visualize/AnnotateTab.svelte';
    import ChartTypeTab from './visualize/ChartTypeTab.svelte';
    import DesignTab from './visualize/DesignTab.svelte';
    import RefineTab from './visualize/RefineTab.svelte';
    import { getContext, onMount } from 'svelte';
    import { chart, visualization } from '../stores';

    export let dwChart;
    export let theme;
    export let data;
    export let visualizations;

    let iframePreview;

    const config = getContext('config');
    $: stickyHeaderThreshold = $config.stickyHeaderThreshold;

    const tabs = [
        { id: 'vis', title: 'Chart type', ui: ChartTypeTab },
        { id: 'refine', title: 'Refine', ui: RefineTab },
        { id: 'annotate', title: 'Annotate', ui: AnnotateTab },
        { id: 'design', title: 'Design', ui: DesignTab }
    ];

    let active = 'refine';
    $: activeTab = tabs.find(d => d.id === active) || tabs[0];
    let scrollY = 0;
    let innerHeight = 0;
    let innerWidth = 0;

    $: isSticky = false && innerHeight > stickyHeaderThreshold && innerWidth > 1200;

    function storeNewSize(event) {
        // todo: store size elsewhere in print mode
        dwChart.set('metadata.publish.embed-width', event.detail.width);
        if (event.detail.height) {
            dwChart.set('metadata.publish.embed-height', event.detail.height);
        }
    }

    onMount(() => {
        let firstVisChange = true;
        visualization.subscribe(vis => {
            if (vis.id) {
                if (!firstVisChange) {
                    visualizationHasChanged();
                }
                firstVisChange = false;
            }
        });
    });

    function visualizationHasChanged() {
        dwChart.onNextSave(() => {
            iframePreview.reset();
            iframePreview.reload();
        });
    }
</script>

<style>
    .preview {
        position: sticky;
        top: 20px;
    }
    .preview.sticky-nav {
        top: 200px;
    }
    .vis-controls.is-sticky {
        position: sticky;
        top: 170px;
        z-index: 880;
    }
    .vis-controls.is-sticky.sticking {
        background: var(--color-dw-white-ter);
        padding-top: 20px;
        padding-bottom: 10px;
    }
    /* .vis-controls.is-sticky:before {
        content: " ";
        display: block;
        background: red;
        width: 100%;
        height: 30px;
        position: absolute;
        bottom: 0;
    } */
</style>

<svelte:window bind:innerHeight bind:innerWidth bind:scrollY />

<div class="container">
    <div class="columns">
        <div class="column is-one-third">
            <div
                class="vis-controls block"
                class:sticking={scrollY >= 50}
                class:is-sticky={isSticky}
            >
                <Tabs items={tabs} bind:active />
            </div>
            <div class="block">
                <svelte:component this={activeTab.ui} {data} {chart} {visualizations} />
            </div>
        </div>
        <div class="column">
            <div class="preview" class:sticky-nav={isSticky}>
                <ChartPreviewIframeDisplay
                    resizable
                    fixedHeight={$visualization.height === 'fixed'}
                    on:resize={storeNewSize}
                    bind:this={iframePreview}
                    {chart}
                    {theme}
                >
                    <div slot="belowPreview" class="block mt-4" style="text-align: center;">
                        - - - - - Some more controls - - - - -<br />x x x x x x
                    </div>
                </ChartPreviewIframeDisplay>
            </div>
        </div>
    </div>
</div>
