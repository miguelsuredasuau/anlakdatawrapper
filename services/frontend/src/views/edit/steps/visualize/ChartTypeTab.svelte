<script>
    import get from '@datawrapper/shared/get';
    import set from '@datawrapper/shared/set';

    // from ../../stores
    export let chart;
    export let visualization;
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

<style>
    .vis-thumb {
        width: 100%;
        padding-bottom: 100%;
        background: #fff;
        position: relative;
        display: inline-block;
        margin: 0;
        border: 0;
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
        fill: #1d81a2;
    }

    .vis-thumb:hover {
        background: rgba(29, 129, 162, 0.2);
    }

    .vis-thumb.active {
        background: #1d81a2;
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
        font-family: 'Roboto', Helvetica, sans-serif;
        font-weight: 500;
        line-height: 14px;
        text-align: center;
    }

    .vis-thumb.active .vis-title {
        color: white;
    }
    .column {
        line-height: 0rem;
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
                    {@html vis.icon}
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
