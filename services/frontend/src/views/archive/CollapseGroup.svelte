<script>
    export let open = true;
    export let title;
</script>

<style lang="scss">
    .toggle {
        display: inline-block;
        border: 0;
        padding: 0;
        background: transparent;
        font-weight: 500;
        margin-left: 20px;
        letter-spacing: 0.02em;
        font-size: 11px;
        line-height: 13px;
        position: relative;

        &:before {
            position: absolute;
            left: -20px;
            top: 3px;
            transition: transform 0.3s ease-in-out;
            display: block;
            content: '\e03d';
            font: normal normal normal 10px/1 'iconmonstr-iconic-font';
        }
        &.open:before {
            transform: rotate(90deg);
        }
    }
</style>

<div class="block">
    <button
        on:click={() => (open = !open)}
        class:open
        class="toggle has-text-grey-dark is-uppercase"
    >
        {title}
    </button>
    {#if open}
        <slot />
    {/if}
</div>
