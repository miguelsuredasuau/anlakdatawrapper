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

    $: isModalCard = $$slots.header || $$slots.footer;
</script>

{#if open}
    <div class="modal is-active">
        <div class="modal-background" style={`opacity: ${backgroundOpacity}`} on:click={close} />
        <div
            class={isModalCard ? 'modal-card' : 'modal-content'}
            style={maxWidth ? `max-width: ${maxWidth}` : ''}
        >
            {#if isModalCard}
                <header class="modal-card-head">
                    <slot name="header" />
                    {#if closeable}
                        <button on:click={close} class="delete" aria-label="close" />
                    {/if}
                </header>
            {/if}
            <section class:modal-card-body={isModalCard}>
                <slot />
            </section>
            {#if isModalCard}
                <footer class="modal-card-foot">
                    <slot name="footer" />
                </footer>
            {/if}
        </div>
        {#if closeable}
            <button on:click={close} class="modal-close is-large" aria-label="close" />
        {/if}
    </div>
{/if}
