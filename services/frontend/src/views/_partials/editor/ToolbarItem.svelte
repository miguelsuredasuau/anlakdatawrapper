<script>
    import HelpDisplay from '_partials/displays/HelpDisplay.svelte';
    export let title = null;

    export let tooltip = null;
</script>

<style>
    .toolbar-header {
        /* todo: replace with correct styles */
        display: flex;
        color: magenta;
        justify-content: space-between;
        gap: 1ex;
        margin-bottom: 1ex;
    }

    .toolbar-body {
        display: flex;
        gap: 1ex;
    }
</style>

<div class="toolbar-item">
    <div class="toolbar-header">
        <div class="toolbar-title">
            {title}
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
