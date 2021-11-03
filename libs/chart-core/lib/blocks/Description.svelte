<script>
    import { clean } from '../shared.mjs';
    // external props
    export let props;
    const { get } = props;
    $: chart = props.chart;
    const allowedTags =
        '<table><thead><tbody><tfoot><caption><colgroup><col><tr><td><th><details><summary>';

    // internal props
    $: description = clean(get(chart, 'metadata.describe.intro'), allowedTags);
</script>

{@html description}
