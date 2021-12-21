<script>
    export let title = '';
    export let type = 'info';
    let className = '';
    export { className as class };
    export let deletable = false;

    let visible = true;
</script>

{#if visible}
    <article
        class="message {type ? `is-${type}` : ''} {deletable ? `is-deletable` : ''} {className}"
    >
        {#if title}
            <div class="message-header">
                <p>{@html title}</p>
                {#if deletable}
                    <button class="delete" on:click={() => (visible = false)} aria-label="delete" />
                {/if}
            </div>
        {/if}
        <div class="message-body">
            {#if !title && deletable}
                <button class="delete" on:click={() => (visible = false)} aria-label="delete" />
            {/if}
            <slot />
        </div>
    </article>
{/if}
