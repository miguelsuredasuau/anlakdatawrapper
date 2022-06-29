<script>
    import { createEventDispatcher } from 'svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml';

    export let title = '';
    export let type = 'info';
    export let deletable = false;
    export let visible = true;

    let className = '';
    export { className as class };

    const dispatch = createEventDispatcher();

    function deleteMessage() {
        visible = false;
        dispatch('delete');
    }
</script>

{#if visible}
    <article
        class="message {type ? `is-${type}` : ''} {deletable ? `is-deletable` : ''} {className}"
    >
        {#if title}
            <div class="message-header">
                <p>{@html purifyHtml(title)}</p>
                {#if deletable}
                    <button class="delete" on:click={deleteMessage} aria-label="delete" />
                {/if}
            </div>
        {/if}
        <div class="message-body">
            {#if !title && deletable}
                <button class="delete" on:click={deleteMessage} aria-label="delete" />
            {/if}
            <slot />
        </div>
    </article>
{/if}
