<script>
    export let open = false;
    export let closeable = true;
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function close() {
        if (closeable) {
            open = false;
            dispatch('close');
        }
    }

    export let maxWidth = null;
    export let backgroundOpacity = 0.5;
</script>

{#if open}
    <div class="modal is-active">
        <div class="modal-background" style={`opacity: ${backgroundOpacity}`} on:click={close} />
        <div class="modal-content" style={maxWidth ? `max-width: ${maxWidth}` : ''}>
            <slot />
        </div>
        {#if closeable}
            <button on:click={close} class="modal-close is-large" aria-label="close" />
        {/if}
    </div>
{/if}
