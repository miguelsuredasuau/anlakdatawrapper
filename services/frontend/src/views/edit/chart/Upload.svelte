<script>
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { getContext } from 'svelte';
    // load stores from context
    const { chart, data, navigateTo } = getContext('page/edit');

    const config = getContext('config');

    export let datasets;
    export let __;
    export let dwChart;
    export let uploadAfterContent = '';
    export let uploadAdditionalCSS = [];
    export let dataReadonly;

    $: props = {
        chart: $chart,
        chartData: $data,
        datasets,
        readonly: dataReadonly,
        navigateTo
    };

    function onChange(event) {
        $data = event.detail;
    }
</script>

<div class="container" class:readonly={dataReadonly}>
    {#if dataReadonly}
        <MessageDisplay><IconDisplay icon="locked" /> {__('edit / data-readonly')}</MessageDisplay>
    {/if}
    <Svelte2Wrapper
        id="svelte/upload"
        js="/lib/static/js/svelte2/upload.js?sha={$config.GITHEAD}"
        css={[`/lib/static/css/svelte2/upload.css?sha=${$config.GITHEAD}`, ...uploadAdditionalCSS]}
        bind:data={props}
        on:change={onChange}
        storeData={{ dw_chart: dwChart }}
    />
</div>

{@html purifyHtml(uploadAfterContent, ['script'])}
