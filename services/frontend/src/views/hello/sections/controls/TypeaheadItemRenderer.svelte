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
        padding-right: 20px;
    }
</style>

<svelte:head>
    <link rel="stylesheet" href="http://static.dwcdn.net/css/flag-icons/flag-icon.min.css" />
</svelte:head>

<a
    href="#/"
    class:is-active={active}
    class="dropdown-item"
    on:click|preventDefault|stopPropagation={() => dispatch('select', item)}
>
    <span class="flag-icon flag-icon-{item.value.toLowerCase()}" />
    {item.label}
</a>
