<script>
    import Context from '../../utils/svelte-view/Context.svelte';
    import View from './DatawrapperInvite.svelte';

    export let stores;

    const viewComponents = new Map();

    // ROLLUP IMPORT VIEW COMPONENTS account/DatawrapperInvite.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
