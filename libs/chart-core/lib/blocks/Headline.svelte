<script>
    // external props
    export let props;
    const { purifyHtml } = props;
    $: chart = props.chart;
</script>

{@html purifyHtml(chart.title)}
