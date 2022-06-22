<script>
    export let title = null;
</script>

<style lang="scss">
    @import '../../../styles/export.scss';
    .toolbar-area-header {
        font-weight: $title-weight;
        letter-spacing: 0.025em;
        text-transform: uppercase;
        font-size: $size-7;
        margin-bottom: 0.25rem;
        color: $grey-darker;
    }
    .toolbar-area-body {
        border: 1px solid $border;
        border-radius: $radius;
        padding: 0.75rem 1rem 1rem;
        display: flex;
        gap: 1rem;
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
