<script>
    import Context from '../../utils/svelte-view/Context.svelte';
    import View from './Index.svelte';

    export let stores;

    const viewComponents = new Map();

    // ROLLUP IMPORT VIEW COMPONENTS web-components/Index.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
