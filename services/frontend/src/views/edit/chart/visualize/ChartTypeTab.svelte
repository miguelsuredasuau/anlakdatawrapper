<script>
    import get from '@datawrapper/shared/get';
    import set from '@datawrapper/shared/set';
    import purifySvg from '@datawrapper/shared/purifySvg';
    import { getContext } from 'svelte';

    const { chart, visualization } = getContext('page/edit');

    // from route
    export let visualizations;
    export let workflow;
    export let __;

    $: chartTypes = visualizations.filter(
        vis =>
            vis.title &&
            (vis.workflow === workflow.id ||
                // include visualizations from other workflows
                vis.includeInWorkflow === workflow.id ||
                get(workflow, 'options.includeInChartTypeSelector', []).includes(vis.workflow))
    );

    function setVisualization(vis) {
        $chart.type = vis.id;
        $chart = $chart;
    }

    function transpose() {
        set($chart, 'metadata.data.transpose', !get($chart, 'metadata.data.transpose'));
        $chart = $chart;
    }
</script>

<style lang="scss">
    @import '../../../../styles/export.scss';
    .vis-thumb {
        width: 100%;
        padding-bottom: 100%;
        background: white;
        position: relative;
        display: inline-block;
        margin: 0;
        border: 0;
        box-shadow: $shadow-small;
        border-radius: $radius-small;
        cursor: pointer;
    }
    .vis-thumb > div {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
    .vis-thumb :global(svg) {
        width: 40%;
        height: 40%;
        margin-top: 19%;
        overflow: visible;
    }

    .vis-thumb :global(svg path),
    .vis-thumb :global(svg rect),
    .vis-thumb :global(svg circle),
    .vis-thumb :global(svg ellipse),
    .vis-thumb :global(svg polyline),
    .vis-thumb :global(svg polygon) {
        fill: $dw-scooter;
    }

    .vis-thumb:hover {
        background: rgba($dw-scooter, 0.2);
    }

    .vis-thumb.active {
        background: $dw-scooter;
    }

    .vis-thumb.active :global(svg path),
    .vis-thumb.active :global(svg rect),
    .vis-thumb.active :global(svg circle),
    .vis-thumb.active :global(svg ellipse),
    .vis-thumb.active :global(svg polyline),
    .vis-thumb.active :global(svg polygon) {
        fill: white;
        opacity: 1;
    }

    .vis-title {
        position: absolute;
        bottom: 8%;
        left: 5px;
        right: 5px;
        font-size: 11px;
        color: $text;
        font-weight: 500;
        line-height: 14px;
        text-align: center;
    }

    .vis-thumb.active .vis-title {
        color: white;
    }
    .column {
        line-height: 0;
    }
</style>

<div class="columns is-multiline is-variable is-1">
    {#each chartTypes as vis}
        <div
            class="column m-0 pt-0 pb-1 is-one-quarter-desktop is-one-third-tablet is-one-fifth-mobile"
        >
            <button
                data-uid="vis-type-button"
                class="vis-thumb"
                class:active={vis.id === $visualization.id}
                on:click={() => setVisualization(vis)}
            >
                <div>
                    {@html purifySvg(vis.icon)}
                    <div class="vis-title">{__(vis.title, vis.__plugin)}</div>
                </div>
            </button>
        </div>
    {/each}
</div>
<p>
    <b>{__('Hint')}:</b>
    {__('visualize / transpose-hint')}
    <button class="button is-ghost is-inline" on:click={transpose}>
        {__('visualize / transpose-button')}
    </button>
</p>
