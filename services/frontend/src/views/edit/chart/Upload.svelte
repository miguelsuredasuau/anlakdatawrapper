<script>
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import { getContext } from 'svelte';
    // load stores from context
    const { chart, data } = getContext('page/edit');

    const config = getContext('config');

    export let chartData;
    export let datasets;
    export let dwChart;
    export let uploadAfterContent = '';
    export let uploadAdditionalCSS = [];

    $: props = {
        // TODO: mimic actual data
        chart: $chart,
        chartData,
        datasets
    };

    function onChange(event) {
        chartData = event.detail;
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
        storeData={{ dw_chart: dwChart }}
    />
</div>

{@html uploadAfterContent}
