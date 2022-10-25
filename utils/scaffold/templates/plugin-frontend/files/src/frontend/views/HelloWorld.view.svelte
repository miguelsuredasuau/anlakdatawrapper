<script>
    import Context from '_utils/svelte-view/Context.svelte';
    import View from './HelloWorld.svelte';

    export let stores;

    const viewComponents = new Map();

    // ROLLUP IMPORT VIEW COMPONENTS HelloWorld.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
