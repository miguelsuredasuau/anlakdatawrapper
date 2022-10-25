<script>
    import Context from '../../utils/svelte-view/Context.svelte';
    import View from './SSOError.svelte';

    export let stores;

    const viewComponents = new Map();

    // ROLLUP IMPORT VIEW COMPONENTS signin/SSOError.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
