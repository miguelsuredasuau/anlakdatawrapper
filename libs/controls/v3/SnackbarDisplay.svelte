<script>
    import IconDisplay from './IconDisplay.svelte';
    import SnackbarButton from './SnackbarButton.svelte';
    import { __ } from '@datawrapper/shared/l10n.js';

    export let delay = 5000;
    export let closed = false;
    export let uid;

    let className;
    export { className as class };

    // Completely hide the element when the component is created in closed state, otherwise the
    // fadeout animation briefly appears.
    let hidden = closed;

    let timeout = null;

    function close() {
        closed = true;
    }

    function startTimeout() {
        if (delay > 0) {
            timeout = setTimeout(() => (closed = true), delay);
        }
    }

    function stopTimeout() {
        clearTimeout(timeout);
    }

    $: if (closed) {
        stopTimeout();
    } else {
        hidden = false;
        startTimeout();
    }
</script>

<style>
    .snackbar {
        position: absolute;
        display: flex;
        width: 100%;
        box-sizing: border-box;
        padding: 0 10px;
        left: 50%;
        transform: translate(-50%, 0);
        bottom: 60px;
        justify-content: center;
        color: #fff;
    }
    .snackbar-row {
        display: flex;
        box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.15);
        border-radius: 17.5px;
    }
    .closed {
        animation: 0.5s forwards fadeout;
    }
    @keyframes fadeout {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0;
            visibility: hidden;
        }
    }
</style>

<div
    class={className}
    class:snackbar={true}
    class:closed
    class:hidden
    on:click={close}
    on:mouseover={stopTimeout}
    on:mouseout={startTimeout}
    data-uid={uid}
>
    <div class="snackbar-row">
        <slot />
        <SnackbarButton title={__('Close')}
            ><IconDisplay icon="close" color="#fff" /></SnackbarButton
        >
    </div>
</div>
