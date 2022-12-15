<script>
    // external props
    export let props;
    const { get, purifyHtml, __ } = props;
    $: chart = props.chart;
    $: themeData = props.themeData;
    $: caption = props.caption;

    // internal props
    $: bylineCaption = get(
        themeData,
        `options.blocks.byline.data.${caption}Caption`,
        __(caption === 'map' ? 'Map:' : caption === 'table' ? 'Table:' : 'Chart:')
    );

    $: byline = get(chart, 'metadata.describe.byline', false);

    $: forkCaption = get(
        themeData,
        'options.blocks.byline.data.forkCaption',
        __('footer / based-on')
    );

    $: needBrackets = chart.basedOnByline && byline;

    $: basedOnByline =
        (needBrackets ? '(' : '') +
        forkCaption +
        ' ' +
        purifyHtml(chart.basedOnByline) +
        (needBrackets ? ')' : '');
</script>

{#if bylineCaption}<span class="byline-caption">{bylineCaption}</span>{/if}
<span class="byline-content">{byline}</span>
{#if chart.basedOnByline}
    {@html purifyHtml(basedOnByline)}
{/if}
