<script>
    import estimateTextWidth from '@datawrapper/shared/estimateTextWidth.js';

    export let props;
    const { get, purifyHtml } = props;
    $: ({ chart, themeData } = props);

    $: monospace = get(themeData, 'options.watermark.monospace', false);
    $: field = get(themeData, 'options.watermark.custom-field');
    $: text = get(themeData, 'options.watermark')
        ? field
            ? get(chart, `metadata.custom.${field}`, '')
            : get(themeData, 'options.watermark.text', 'CONFIDENTIAL')
        : false;

    let width;
    let height;

    $: angle = -Math.atan(height / width);
    $: angleDeg = (angle * 180) / Math.PI;

    $: diagonal = Math.sqrt(width * width + height * height);

    // estimateTextWidth works reasonable well for normal fonts
    // set themeData.options.watermark.monospace to true if you
    // have a monospace font
    $: estWidth = monospace ? text.length * 20 : estimateTextWidth(text, 20);
    $: fontSize = `${Math.round(20 * ((diagonal * 0.75) / estWidth))}px`;
</script>

<style>
    div {
        position: fixed;
        opacity: 0.182;
        font-weight: 700;
        font-size: 0;
        white-space: nowrap;
        left: -100px;
        top: 0px;
        right: -100px;
        line-height: 100vh;
        bottom: 0;
        text-align: center;
        pointer-events: none;
        transform-origin: middle center;
    }
</style>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<div
    class="watermark noscript"
    style="transform:rotate({angle}rad); font-size: {fontSize}"
    data-rotate={angleDeg}
>
    <span>
        {@html purifyHtml(text)}
    </span>
</div>
