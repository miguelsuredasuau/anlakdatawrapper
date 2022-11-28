<script>
    export let active = false;
    export let disabled = false;
    export let up = false;
    export let uid;

    let dropdown;
    export let align = 'left';

    let className = '';
    export { className as class };

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
    .dropdown,
    .dropdown-trigger {
        max-width: 100%;
    }

    .dropdown-menu {
        z-index: 999;
    }

    .dropdown.is-disabled {
        pointer-events: none;
        cursor: default;
    }
</style>

<svelte:window on:click={windowClick} />
<div
    class="dropdown {className}"
    bind:this={dropdown}
    class:is-active={active}
    class:is-disabled={disabled}
    class:is-up={up}
    class:is-right={align === 'right'}
    data-uid={uid}
>
    <div class="dropdown-trigger" on:click={toggle}>
        <slot name="trigger" />
    </div>
    <div class="dropdown-menu" role="menu">
        <slot name="content" />
    </div>
</div>
