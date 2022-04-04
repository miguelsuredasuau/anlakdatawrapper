<script>
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import { getContext } from 'svelte';
    const config = getContext('config');

    export let chart;
    export let data;
    export let chartData;
    export let datasets;
    export let dw_chart;
    export let uploadAfterContent = '';
    export let uploadAdditionalCSS = [];

    $: props = {
        // TODO: mimic actual data
        chart: $chart,
        chartData,
        datasets
    };

    function onChange(event) {
        $data = event.detail;
    }
</script>

<div class="container">
    <Svelte2Wrapper
        id="svelte/upload"
        js="/lib/static/js/svelte2/upload.js?sha={$config.GITHEAD}"
        css={[`/lib/static/css/svelte2/upload.css?sha=${$config.GITHEAD}`, ...uploadAdditionalCSS]}
        bind:data={props}
        on:change={onChange}
        storeData={{ dw_chart }}
    />
</div>

{@html uploadAfterContent}
