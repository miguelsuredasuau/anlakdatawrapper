<script>
    import { getContext } from 'svelte';
    import { version } from '../../../../../../libs/icons/package.json';

    const LIB_ROOT_FALLBACK = '/lib/';

    export let icon = 'api';
    export let size = false;
    export let color = 'currentColor';
    export let valign = '-0.15em';
    export let crisp = false;

    export let className = '';

    export let spin = false;
    export let timing = 'linear';
    export let duration = '2s';

    const libRoot = getContext('libRoot') || LIB_ROOT_FALLBACK;

    const iconsVersion = version;
</script>

<style>
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(359deg);
        }
    }
    .spin {
        animation: spin 2s infinite linear;
    }
    .crisp {
        shape-rendering: crispEdges;
    }

    .icon {
        /* font-size: inherit; */
        width: auto;
        height: auto;
    }
    .icon svg {
        width: 1em;
        height: 1em;
    }
</style>

<span
    class="icon {className}"
    class:spin
    style="vertical-align: {valign}; {spin
        ? `animation-duration:${duration};  animation-timing-function: ${timing};`
        : ''}"
>
    <svg class="svg-{icon}-dims" class:crisp style={size ? `font-size:${size};` : ''}>
        <use
            style="fill: {color}"
            xlink:href="{libRoot}icons/symbol/svg/sprite.symbol.svg?v={iconsVersion}#{icon}"
        />
    </svg>
</span>
