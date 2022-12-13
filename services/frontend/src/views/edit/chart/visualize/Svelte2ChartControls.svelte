<script>
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import dwVisualization from '@datawrapper/chart-core/lib/dw/visualization';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import { onMount, tick, getContext } from 'svelte';
    import isEqual from 'lodash/isEqual';
    import clone from 'lodash/cloneDeep';
    import get from 'lodash/get';
    import set from 'lodash/set';
    import debounce from 'lodash/debounce';
    import assign from 'assign-deep';
    import { logError, waitFor } from '../../../../utils';
    import { combineLatest } from 'rxjs';
    import { debounceTime, skip, startWith } from 'rxjs/operators';
    // load stores from context
    const { chart, theme, visualization, locale, dataset } = getContext('page/edit');

    export let __;
    export let dwChart;
    export let teamSettings;
    export let controlsModule = 'Refine';

    const dataHasChanged = combineLatest(
        chart.bindKey('metadata.data'),
        chart.bindKey('metadata.describe.computed-columns')
    ).pipe(skip(1), debounceTime(500), startWith(false));

    onMount(() => {
        chart.subscribe(() => {
            updateStoreData();
        });
        locale.subscribe(() => {
            updateStoreData();
        });
    });

    $: loadControls($visualization);
    $: if ($dataHasChanged) loadVisualization();

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
        if (!visualization || !visualization.id || typeof document === 'undefined') {
            return;
        }
        const type = visualization.id;
        controlsReady = false;

        await applyDefaultsAndMigration();

        // load script that registers visualization
        window.dw.visualization = dwVisualization;
        await dynamicImport(
            `/lib/plugins/${visualization.__plugin}/static/${type}.js?sha=${visualization.__visHash}`
        );
        // create visualization instance
        await loadVisualization();
        controlsReady = true;
    }

    async function loadVisualization() {
        const type = $visualization.id;

        try {
            const newVis = await waitFor(() => dwVisualization(type));
            newVis.meta = $visualization;
            newVis.chart(dwChart);
            newVis.theme = () => $theme.data;
            vis = newVis;
            updateStoreData();
            await tick();
        } catch (e) {
            console.error(e);
            logError(new Error(`Unknown visualization type: ${type}`));
        }
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
            $chart.metadata.visualize = assign(
                clone($visualization.defaultMetadata),
                $chart.metadata.visualize
            );
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
        const url =
            typeof __dirname === 'undefined'
                ? filename // Client-side rendering
                : filename.replace(/^\/lib\/plugins\//, `${__dirname}/../../../../../plugins/`); // Server-side rendering
        return eval(`import('${url}')`);
    }

    /*
     * setMetadata and getMetadata are convenience wrappers
     * provided by our SvelteChart which simplify access to
     * chart.metadata properties
     */
    function setMetadata(key, value) {
        const curVal = get($chart.metadata, key);
        if (!isEqual(curVal, value)) {
            set($chart.metadata, key, value);
            // this will trigger an updateStoreData() call (see chart.subscribe callback above)
            $chart = $chart;
        }
    }

    function getMetadata(key, fallback) {
        if (!key) return storeData.metadata;
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

    function getChartFromStoreData(data) {
        const newChart = { ...data };
        delete newChart.vis;
        delete newChart.visualization;
        delete newChart.teamSettings;
        delete newChart.dataset;
        delete newChart.themeData;
        delete newChart.computedThemeData;
        return newChart;
    }

    function updateChart(data) {
        const newChart = getChartFromStoreData(data);

        if (!isEqual($chart, newChart)) {
            $chart = newChart;
        }

        storeData = clone(data);
        prevStoreData = clone(data);
    }

    const updateChartDebounced = debounce(updateChart, 0);

    function onStoreDataUpdate(event) {
        const newStoreData = event.detail.store;
        if (isEqual(newStoreData, prevStoreData)) return;

        // We need to debounce the updateChart call to prevent an issue with simple-maps where old chart data is emitted
        // immediately after the chart has been changed from outside the svelte2 controls (e.g. via the datatable).
        // This old data would then replace the changes that triggered the update in the first place.
        // See: https://www.notion.so/ed3657720eb741e5b5d1dc6f1087f99f
        updateChartDebounced(event.detail.store);
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
        {storeData}
        on:update={onStoreDataUpdate}
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
