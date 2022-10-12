<script>
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    import { getContext } from 'svelte';
    import numeral from 'numeral';

    const config = getContext('config');

    const { data, navigateTo, tableDataset, vendorLocales } = getContext('page/edit');

    export let __;
    export let dwChart;
    export let showLocaleSelect;
    export let language;
    export let dataReadonly;

    $: {
        if ($vendorLocales.numeral) {
            try {
                numeral.register('locale', 'dw', $vendorLocales.numeral);
            } catch (ex) {
                numeral.locales.dw = $vendorLocales.numeral;
            }
            numeral.locale('dw');
        }
    }

    $: props = {
        numeral,
        dayjsLocale: $vendorLocales.dayjs,
        readonly: dataReadonly,
        chartData: $data,
        showLocaleSelect,
        navigateTo
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
        data={props}
        storeData={{
            dw_chart: dwChart,
            tableDataset: $tableDataset,
            language,
            locales: $config.chartLocales.map(({ id, title }) => ({ value: id, label: title }))
        }}
    />
</div>
