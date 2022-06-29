<script>
    import purifyHtml from '@datawrapper/shared/purifyHtml';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let active = false;
    export let lastActiveStep;
    $: visited = step.index <= lastActiveStep;
    export let step = { index: 0, title: 'foo' };
    // internals
    let height = 48;
    let width = 294;

    const tipWidthRatio = 0.75;
    const tipBorderRadius1 = 2;
    const tipBorderRadius2 = 3.4;
    const tipOffset = 0.04;

    $: halfHeight = height / 2;

    $: tipWidth = halfHeight * tipWidthRatio;

    $: topPath = `M 0 0 l ${width - tipWidth - tipBorderRadius1},0 q ${tipBorderRadius1},0 ${
        tipBorderRadius1 * 2
    } ${tipBorderRadius1}`;
    $: tipPath = `L ${width - tipBorderRadius2 * tipWidthRatio + tipWidth * tipOffset},${
        halfHeight - tipBorderRadius2
    } Q ${width + tipWidth * tipOffset},${halfHeight} ${
        width - tipBorderRadius2 * tipWidthRatio + tipWidth * tipOffset
    },${halfHeight + tipBorderRadius2}`;
    $: bottomPath = `L ${width - tipWidth + tipBorderRadius1},${
        height - tipBorderRadius1
    } q ${-tipBorderRadius1},${tipBorderRadius1} ${
        -tipBorderRadius1 * 2
    },${tipBorderRadius1} L 0,${height} z`;
    $: clipPath = `${topPath} ${tipPath} ${bottomPath}`;
</script>

<style lang="less">
    a {
        background: var(--color-dw-grey-lighter);
        border-radius: 4px;
        display: inline-block;
        width: 100%;
        line-height: 2rem;
        white-space: nowrap;
        &.active {
            background: var(--color-dw-firebrick);
            color: white;
            cursor: default;
            &:hover {
                text-decoration: none;
            }
        }
    }
    .step {
        display: inline-block;
        font-weight: bold;
        color: white;
        vertical-align: -0.2rem;
        text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.1);
        font-size: 26px;
    }
</style>

<a
    href={step.id}
    on:click|preventDefault={event => !active && dispatch('navigate', { ...step, event })}
    bind:clientHeight={height}
    bind:clientWidth={width}
    class="px-4 py-2 is-size-5"
    class:active
    class:visited
    style="clip-path: path('{clipPath}');"
>
    <span class="step ml-1 mr-3">{step.index}</span>{@html purifyHtml(step.title)}
    {#if !active && visited}
        <i class="fa fa-check" />
    {/if}
</a>
