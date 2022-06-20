<script>
    import HelpDisplay from '_partials/displays/HelpDisplay.svelte';
    export let title = null;

    export let tooltip = null;
</script>

<style lang="scss">
    @import '../../../styles/export.scss';

    .toolbar-header {
        display: flex;
        color: $grey-dark;
        justify-content: space-between;
        font-size: $size-7;
        margin-bottom: 0.25rem;
        column-gap: 0.5em;
    }

    .toolbar-body {
        display: flex;
        gap: 0.5rem;

        > :global(.field.is-grouped > .control) {
            margin-right: 0.25rem;
        }
    }
</style>

<div class="toolbar-item">
    <div class="toolbar-header">
        <div class="toolbar-title">
            {#if title}{@html title}{/if}
            <slot name="title" />
        </div>
        {#if tooltip || $$slots.tooltip}
            <HelpDisplay inline>
                {#if tooltip}{@html tooltip}{/if}
                <slot name="tooltip" />
            </HelpDisplay>
        {/if}
    </div>
    <div class="toolbar-body">
        <slot />
    </div>
    {#if $$slots.footer}
        <div class="toolbar-footer">
            <slot name="footer" />
        </div>
    {/if}
</div>
