<script>
    import HelpDisplay from '_partials/displays/HelpDisplay.svelte';
    export let title = null;

    export let tooltip = null;
    export let tooltipType = null;
    export let tooltipPlacement = 'right';
    export let uid = null;
</script>

<style lang="scss">
    @import '../../../styles/export.scss';

    .toolbar-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.25rem;
        column-gap: 0.5em;
    }

    .toolbar-title {
        color: $grey-dark;
        font-size: $size-7;
        :global(.icon) {
            font-size: $size-5;
            vertical-align: middle;
        }
    }
    .toolbar-body {
        display: flex;
        gap: 0.5rem;

        > :global(.field.is-grouped > .control) {
            margin-right: 0.25rem;
        }

        > :global(.field) {
            margin-bottom: 0;
        }
    }
</style>

<div class="toolbar-item" data-uid={uid}>
    <div class="toolbar-header">
        <div class="toolbar-title">
            {#if title}{@html title}{/if}
            <slot name="title" />
        </div>
        {#if tooltip || $$slots.tooltip}
            <HelpDisplay inline type={tooltipType} placement={tooltipPlacement}>
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
