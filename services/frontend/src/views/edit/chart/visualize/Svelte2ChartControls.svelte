<script>
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import dwVisualization from '@datawrapper/chart-core/lib/dw/visualization';
    import purifyHtml from '@datawrapper/shared/purifyHtml';
    import { onMount, tick, getContext } from 'svelte';
    import isEqual from 'lodash/isEqual';
    import clone from 'lodash/cloneDeep';
    import { loadScript } from '@datawrapper/shared/fetch';
    import get from 'lodash/get';
    import set from 'lodash/set';
    // load stores from context
    const { chart, theme, visualization, locale, dataset } = getContext('page/edit');

    export let __;
    export let dwChart;
    export let teamSettings;
    export let controlsModule = 'Refine';

    onMount(() => {
        chart.subscribe(() => {
            updateStoreData();
        });
        locale.subscribe(() => {
            updateStoreData();
        });
    });

    $: loadControls($visualization);

    let vis;

    function updateStoreData() {
        if (!$chart || !$locale) {
            return;
        }
        storeData = {
            ...clone($chart),
            vis,
            dataset: $dataset,
            textDirection: $locale.textDirection,
            visualization: $visualization,
            themeData: $theme.data,
            computedThemeData: $theme._computed,
            teamSettings
        };
        prevStoreData = clone(storeData);
    }

    async function loadControls(visualization) {
        if (!visualization || !visualization.id) {
            return;
        }
        const type = visualization.id;
        controlsReady = false;

        await applyDefaultsAndMigration();

        // load script that registers visualzation
        window.dw.visualization = dwVisualization;
        await loadScript(`/lib/plugins/${visualization.__plugin}/static/${type}.js`);
        // create visualization instance
        const newVis = dwVisualization(type);
        newVis.meta = visualization;
        newVis.chart(dwChart);
        newVis.theme = () => $theme.data;
        vis = newVis;

        updateStoreData();
        await tick();
        controlsReady = true;
    }

    async function applyDefaultsAndMigration() {
        if ($visualization && $visualization.controls.migrate) {
            // load and execute migrate.js
            const { default: migrate } = await dynamicImport($visualization.controls.migrate);
            if (typeof migrate === 'function') {
                migrate($chart.type, $chart.metadata, $dataset);
            }
        }
        // apply defaults from visualization
        if ($visualization.defaultMetadata) {
            $chart.metadata.visualize = {
                ...$visualization.defaultMetadata,
                ...$chart.metadata.visualize
            };
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

    /*
     * setMetadata and getMetadata are convenience wrappers
     * provided by our SvelteChart which simplify access to
     * chart.metadata properties
     */
    function setMetadata(key, value) {
        const curVal = get($chart.metadata, key);
        if (!isEqual(curVal, value)) {
            set(storeData.metadata, key, value);
            storeData = storeData;
        }
    }

    function getMetadata(key, fallback) {
        return get(storeData.metadata, key, fallback);
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
                >{@html purifyHtml(notification.message)}</MessageDisplay
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
    >
        <article slot="error" class="message is-danger my-6">
            <div class="message-header">{__('edit / controls-loading-error / title')}</div>
            <div class="message-body">
                <p>{@html __('edit / controls-loading-error / description')}</p>
                <button
                    class="button my-3"
                    on:click|stopPropagation={() => window.location.reload()}
                    >{__('edit / controls-loading-error / button')}</button
                >
                <p>{@html __('edit / controls-loading-error / contact')}</p>
            </div>
        </article>
    </Svelte2Wrapper>
{/if}
