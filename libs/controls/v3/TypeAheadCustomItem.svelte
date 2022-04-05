<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let item;
    export let active;
</script>

<style>
    .dropdown-item {
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }
</style>

<div
    class:selected={active}
    class="dropdown-item"
    on:click|preventDefault|stopPropagation={() => dispatch('select', item)}
>
    Your option: {item.label}
</div>
