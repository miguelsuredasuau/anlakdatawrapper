<script>
    /**
     * @deprecated
     * Please use `MessageDisplay` instead of this component.
     * for background, see here https://datawrapper.slack.com/archives/CE41BUB24/p1639150483017600
     */
    export let deletable = true;
    export let type = '';
    export let visible = true;
    export let className = '';
</script>

{#if visible}
    <div class="notification {type ? `is-${type}` : ''} {className}">
        {#if deletable}<button
                aria-label="delete"
                on:click={() => (visible = false)}
                class="delete"
            />{/if}
        <slot />
    </div>
{/if}
