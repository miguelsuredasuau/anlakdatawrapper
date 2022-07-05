<script>
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    import { getContext } from 'svelte';

    const config = getContext('config');

    export let __;
    export let dwChart;
    export let chartData;
    export let showLocaleSelect;
    export let language;
    export let dataReadonly;

    let data = {
        readonly: dataReadonly,
        chartData,
        showLocaleSelect
    };
</script>

<div class="container">
    {#if dataReadonly}
        <MessageDisplay><IconDisplay icon="locked" /> {__('edit / data-readonly')}</MessageDisplay>
    {/if}

    <Svelte2Wrapper
        id="svelte/describe"
        js="/lib/static/js/svelte2/describe.js?sha={$config.GITHEAD}"
        css={[
            `/lib/static/css/svelte2/describe.css?sha=${$config.GITHEAD}`,
            '/lib/static/css/handsontable.min.css',
            '/static/vendor/codemirror/lib/codemirror.css',
            '/static/vendor/codemirror/addon/hint/show-hint.css'
        ]}
        bind:data
        storeData={{
            dw_chart: dwChart,
            language,
            locales: $config.chartLocales.map(({ id, title }) => ({ value: id, label: title }))
        }}
    />
</div>
