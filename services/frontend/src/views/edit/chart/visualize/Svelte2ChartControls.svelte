<script>
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import dwVisualization from '@datawrapper/chart-core/lib/dw/visualization';
    import { onMount, tick, getContext, onDestroy } from 'svelte';
    import isEqual from 'lodash/isEqual';
    import clone from 'lodash/cloneDeep';
    import { loadScript } from '@datawrapper/shared/fetch';
    // load stores from context
    const { chart, theme, visualization } = getContext('page/edit');

    export let dwChart;
    export let visualizations;
    export let teamSettings;
    export let controlsModule = 'Refine';

    let visUnsubscribe;

    onMount(() => {
        visUnsubscribe = visualization.subscribe(vis => {
            if (vis && vis.id) {
                loadControls(vis.id);
            }
        });
    });

    onDestroy(() => {
        if (typeof visUnsubscribe === 'function') {
            // unsubscribe from vis changes after the Refine/Annotate
            // tab has been destroyed (e.g. the user switched tab)
            visUnsubscribe();
        }
    });

    let vis;
    let dataset;

    function getStoreData() {
        return {
            ...clone($chart),
            vis,
            dataset,
            visualization: visualizations.find(v => v.id === $chart.type),
            themeData: $theme.data,
            computedThemeData: $theme._computed,
            teamSettings
        };
    }

    async function loadControls(type) {
        controlsReady = false;

        await applyDefaultsAndMigration();

        // load script that registers visualzation
        const visMeta = visualizations.find(v => v.id === type);
        window.dw.visualization = dwVisualization;
        await loadScript(`/lib/plugins/${visMeta.__plugin}/static/${type}.js`);
        // create visualization instance
        vis = dwVisualization(type);
        vis.meta = visMeta;
        vis.chart(dwChart);
        vis.theme = () => $theme.data;

        // load dataset from chart
        dataset = dwChart.dataset();
        storeData = getStoreData();
        prevStoreData = clone(storeData);
        await tick();
        controlsReady = true;
    }

    async function applyDefaultsAndMigration() {
        // apply defaults from visualization
        if ($visualization.defaultMetadata) {
            $chart.metadata.visualize = {
                ...$visualization.defaultMetadata,
                ...$chart.metadata.visualize
            };
        }

        if ($visualization && $visualization.controls.migrate) {
            // load and execute migrate.js
            const { default: migrate } = await dynamicImport($visualization.controls.migrate);
            if (typeof migrate === 'function') {
                migrate($chart.type, $chart.metadata, dataset);
            }
        }
    }

    /**
     * Dynamically import a JS module using the browser import() API.
     *
     * We are wrapping the call in eval() to prevent rollup from hijacking
     * the import() method, which would break the import since as of now rollup
     * does not support dynamic imports from variable filenames. For more
     * information see
     *
     * - https://github.com/rollup/rollup/issues/2463
     * - https://github.com/rollup/rollup/issues/2097
     *
     * @param filename - the file to import
     */
    function dynamicImport(filename) {
        return eval(`import('${filename}')`);
    }

    function setMetadata(key, value) {
        dwChart.setMetadata(key, value);
    }

    function getMetadata(key, fallback) {
        return dwChart.getMetadata(key, fallback);
    }

    function observeDeep(key, handler) {
        if (key === 'visualization') {
            visualization.subscribe(handler);
        } else if (key.startsWith('metadata')) {
            chart.subscribeKey(key, handler);
        }
    }

    let state = {};
    let storeData = {};
    let prevStoreData = {};
    let controlsReady = false;
    let notifications = [];

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
    {#if notifications.length}
        {#each notifications as notification}
            <MessageDisplay type={notification.type} deletable={notification.closeable}
                >{@html notification.message}</MessageDisplay
            >
        {/each}
    {/if}
    <Svelte2Wrapper
        id={$visualization.controls.amd}
        js="/lib/plugins/{$visualization.controls.js}?sha={$visualization.__controlsHash}"
        css="/lib/plugins/{$visualization.controls.css}?sha={$visualization.__controlsHash}"
        module={controlsModule}
        bind:storeData
        storeMethods={{ getMetadata, setMetadata, observeDeep }}
        bind:data={state}
        on:init={evt => {
            notifications = evt.detail._state.notifications || [];
        }}
        on:state={evt => {
            notifications = evt.detail.current.notifications || [];
        }}
    />
{/if}
