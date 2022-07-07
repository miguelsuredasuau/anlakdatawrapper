<script>
    import { clean } from '../shared.mjs';
    // external props
    export let props;
    const { get } = props;
    $: chart = props.chart;
    const allowedTags =
        '<table><thead><tbody><tfoot><caption><colgroup><col><tr><td><th><details><summary>';

    // internal props
    $: description = get(chart, 'metadata.describe.intro');
</script>

{@html clean(description, allowedTags)}
