<script>
    export let active = false;

    let dropdown;
    export let align = 'left';

    function toggle() {
        active = !active;
    }

    function windowClick(event) {
        if (active && !dropdown.contains(event.target)) active = false;
    }
</script>

<style lang="scss">
    @import '../../styles/colors.scss';
    .dropdown {
        :global(.dropdown-divider) {
            margin: 0.25rem 0;
        }
        :global(.dropdown-item) {
            margin: 0 0.25rem;
            width: auto;
        }
        :global(.dropdown-item:hover) {
            color: $dw-scooter;
        }
        :global(.dropdown-item .icon) {
            font-size: 18px;
            margin-right: 4px;
            color: $dw-scooter;
        }
    }
</style>

<svelte:window on:click={windowClick} />
<div
    class="dropdown"
    bind:this={dropdown}
    class:is-active={active}
    class:is-right={align === 'right'}
>
    <div class="dropdown-trigger" on:click={toggle}>
        <slot name="trigger" />
    </div>
    <div class="dropdown-menu" role="menu">
        <slot name="content" />
    </div>
</div>
