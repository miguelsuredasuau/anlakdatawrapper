<script>
    export let active = false;
    export let disabled = false;

    let dropdown;
    export let align = 'left';

    function toggle() {
        if (!disabled) {
            active = !active;
        }
    }

    function windowClick(event) {
        if (active && !dropdown.contains(event.target)) active = false;
    }
</script>

<style lang="scss">
    // @import '../../styles/export.scss';
    .dropdown.is-disabled {
        pointer-events: none;
        cursor: default;
    }
</style>

<svelte:window on:click={windowClick} />
<div
    class="dropdown"
    bind:this={dropdown}
    class:is-active={active}
    class:is-disabled={disabled}
    class:is-right={align === 'right'}
>
    <div class="dropdown-trigger" on:click={toggle}>
        <slot name="trigger" />
    </div>
    <div class="dropdown-menu" role="menu">
        <slot name="content" />
    </div>
</div>
