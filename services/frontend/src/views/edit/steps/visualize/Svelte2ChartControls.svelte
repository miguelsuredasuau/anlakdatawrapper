<script>
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import dwVisualization from '@datawrapper/chart-core/lib/dw/visualization';
    import { onMount, tick } from 'svelte';
    import isEqual from 'lodash/isEqual';
    import clone from 'lodash/cloneDeep';
    import { loadScript } from '@datawrapper/shared/fetch';

    export let chart;
    export let dwChart;
    export let theme;
    export let visualization;
    export let visualizations;
    export let subscribeChart;
    export let teamSettings;
    export let controlsModule = 'Refine';

    onMount(() => {
        loadControls($chart.type);
        subscribeChart('type', newType => {
            if (newType) {
                loadControls(newType);
            }
        });
    });

    let vis;
    let dataset;

    function getStoreData() {
        return {
            ...clone($chart),
            vis,
            dataset,
            visualization: visualizations.find(v => v.id === $chart.type),
            themeData: theme.data,
            computedThemeData: theme._computed,
            teamSettings
        };
    }

    async function loadControls(type) {
        controlsReady = false;
        // load script that registers visualzationn
        const visMeta = visualizations.find(v => v.id === type);
        window.dw.visualization = dwVisualization;
        await loadScript(`/lib/plugins/${visMeta.__plugin}/static/${type}.js`);
        // create visualization instance
        vis = dwVisualization(type);
        vis.meta = visMeta;
        vis.chart(dwChart);
        // load dataset from chart
        dataset = dwChart.dataset();
        storeData = getStoreData();
        prevStoreData = clone(storeData);
        await tick();
        controlsReady = true;
    }

    function setMetadata(key, value) {
        dwChart.setMetadata(key, value);
    }

    function getMetadata(key, fallback) {
        return dwChart.getMetadata(key, fallback);
    }

    function beforeInitControls(event) {
        // apply defaults from visualization
        if ($visualization.defaultMetadata) {
            $chart.metadata.visualize = {
                ...$visualization.defaultMetadata,
                ...$chart.metadata.visualize
            };
        }
        // apply migrations
        if (event.detail.migrate) {
            event.detail.migrate($chart.type, $chart.metadata, dataset);
        }

        // check if we have something to store
        $chart = $chart;
        // update store data
        storeData = getStoreData();
    }

    let state = {};
    let storeData = {};
    let prevStoreData = {};
    let controlsReady = false;

    $: {
        if (controlsReady && !isEqual(storeData, prevStoreData)) {
            const newChart = clone(storeData);
            // remove anything that's not originally from chart
            delete newChart.vis;
            delete newChart.visualization;
            delete newChart.teamSettings;
            delete newChart.dataset;
            delete newChart.themeData;
            delete newChart.computedThemeData;
            // check if remaining object is still different from $chart
            if (!isEqual($chart, newChart)) {
                $chart = newChart;
            }
            prevStoreData = clone(storeData);
        }
    }
</script>

{#if controlsReady}
    <Svelte2Wrapper
        id={$visualization.controls.amd}
        js="/static/plugins/{$visualization.controls.js}"
        css="/static/plugins/{$visualization.controls.css}"
        module={controlsModule}
        on:beforeInit={beforeInitControls}
        bind:storeData
        storeMethods={{ getMetadata, setMetadata }}
        bind:data={state}
    />
{/if}
