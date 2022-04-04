<script>
    import Svelte2Wrapper from '_partials/svelte2/Svelte2Wrapper.svelte';

    export let dw_chart;
    export let chartData;

    let data = {
        // TODO: load actual data
        readonly: false,
        chartData,
        user: {}
    };
</script>

<div class="container">
    <Svelte2Wrapper
        id="svelte/describe"
        js="/static/js/svelte/describe.js"
        css={[
            '/static/css/svelte/describe.css',
            '/static/vendor/hot/handsontable.min.css',
            '/static/vendor/codemirror/lib/codemirror.css',
            '/static/vendor/codemirror/addon/hint/show-hint.css'
        ]}
        bind:data
        storeData={{ dw_chart }}
    />
</div>
