<script>
    // external props
    export let props;
    const { get } = props;
    $: themeData = props.themeData;

    $: data = get(themeData, `options.blocks.${props.id}.data`, {});
    $: border = get(data, 'border', '1px solid #cccccc');
    $: margin = get(data, 'margin', '0px');
</script>

<hr class="dw-line" style="border: 0; border-bottom: {border}; margin: {margin};" />
