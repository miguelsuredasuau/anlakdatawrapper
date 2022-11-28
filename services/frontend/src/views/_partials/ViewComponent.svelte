<script>
    import { getContext } from 'svelte';

    export let id;
    export let props = {};
    export let __;

    const viewComponents = getContext('viewComponents');
</script>

<svelte:component this={viewComponents.get(id)} {...props} {__} on:change>
    <slot />
</svelte:component>
