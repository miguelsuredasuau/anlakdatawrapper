<script>
    import Context from '../utils/svelte-view/Context.svelte';
    import View from './Create.svelte';

    export let stores;

    const viewComponents = new Map();

    // ROLLUP IMPORT VIEW COMPONENTS Create.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
