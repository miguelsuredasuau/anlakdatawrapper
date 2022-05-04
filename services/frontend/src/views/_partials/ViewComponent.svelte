<script>
    import { getContext } from 'svelte';

    export let id;
    export let props = {};
    export let __;

    const viewComponents = getContext('viewComponents');

    if (!viewComponents.has(id)) throw new Error(`View component '${id}' is not registered`);

    const component = viewComponents.get(id);
</script>

{#if component}
    <svelte:component this={component} {...props} {__} on:change />
{/if}
