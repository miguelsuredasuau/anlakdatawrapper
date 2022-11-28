<script>
    import Context from '../../utils/svelte-view/Context.svelte';
    import View from './DatawrapperInvite.svelte';
    import { ViewComponents } from '_utils/view-components.mjs';

    export let stores;

    const viewComponents = new ViewComponents();

    // ROLLUP IMPORT VIEW COMPONENTS account/DatawrapperInvite.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
