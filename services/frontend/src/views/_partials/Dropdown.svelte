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
    // @import '../../styles/export.scss';
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
