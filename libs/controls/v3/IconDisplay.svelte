<script>
    export let icon = 'api';
    export let size = '1em';
    export let color = 'inherit';
    export let valign = 'baseline';
    export let uid;

    let className = '';
    export { className as class };
    export let spin = false;
    export let timing = 'linear';
    export let duration = '2s';
    export let assetURL;
    // Path to SVG tile set on https://app.datawrapper.de:
    const DEFAULT_ASSET_URL = '/lib/icons/symbol/svg/sprite.symbol.svg';

    $: iconURL = `${assetURL || DEFAULT_ASSET_URL}#${icon}`;
</script>

<style>
    svg {
        color: inherit;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(359deg);
        }
    }

    .svg-icon {
        display: inline-block;
    }

    .spin {
        animation: spin 1.5s infinite linear;
    }
</style>

<span
    data-uid={uid}
    class="svg-icon {className}"
    class:spin
    style="animation-timing-function: {timing}; animation-duration: {duration}; height: {size}; width: {size}; vertical-align: {valign}"
>
    <svg style="height: {size}; width: {size}">
        <use style="fill: {color}" xlink:href={iconURL} />
    </svg>
</span>
