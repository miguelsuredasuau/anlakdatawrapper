<script>
    import { clean } from '../shared.mjs';
    // external props
    export let props;
    const { get } = props;
    $: chart = props.chart;
</script>

{@html clean(get(chart, 'metadata.annotate.notes'), ['details', 'summary'])}
