<script>
    export let title = null;
</script>

<style>
    .toolbar-area-header {
        /* todo: replace with correct styles */
        font-weight: bold;
        color: magenta;
        text-transform: uppercase;
    }
    .toolbar-area-body {
        /* todo: replace with correct styles */
        border: 1px solid magenta;
        border-radius: 4px;
        padding: 1em;
        gap: 1em;
        display: flex;
    }
</style>

<div class="toolbar-area">
    <div class="toolbar-area-header">
        {#if title}{@html title}{/if}
        <slot name="title" />
    </div>
    <div class="toolbar-area-body">
        <slot />
    </div>
    {#if $$slots.footer}
        <div class="toolbar-area-footer">
            <slot name="footer" />
        </div>
    {/if}
</div>
