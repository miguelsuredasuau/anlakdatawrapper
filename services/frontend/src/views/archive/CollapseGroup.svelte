<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    export let open = true;
    export let title;
    export let className;
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
    .collapse-toggle {
        display: inline-block;
        border: 0;
        background: transparent;
        font-weight: 500;
        letter-spacing: 0.05em;
        font-size: 11px;
        line-height: 1.2;
        position: relative;
        color: $dw-grey-dark;
        cursor: pointer;

        &:focus:not(:focus-visible) {
            box-shadow: none;
        }
        &:hover {
            color: $dw-black-bis;
        }
        :global(.icon) {
            transform-origin: center;
            font-size: 12px;
            transition: transform 0.2s;
            transition-timing-function: ease-out;
            position: relative;
            top: 2px;
        }
        &.open :global(.icon) {
            transform: rotate(90deg);
        }
    }
</style>

<div class="block {className || ''}">
    <button
        on:click={() => (open = !open)}
        class:open
        class="collapse-toggle is-uppercase px-1 py-2"
    >
        <IconDisplay icon="disclosure" valign="baseline" className="m-0" />
        {title}
    </button>
    {#if open}
        <slot />
    {/if}
</div>
