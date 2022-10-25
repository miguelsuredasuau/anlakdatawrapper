<script>
    import Context from '../utils/svelte-view/Context.svelte';
    import View from './Error.svelte';

    export let stores;

    const viewComponents = new Map();

    // ROLLUP IMPORT VIEW COMPONENTS Error.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
