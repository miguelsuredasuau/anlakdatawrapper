<script>
    import Context from '../../utils/svelte-view/Context.svelte';
    import View from './SSOError.svelte';
    import { ViewComponents } from '_utils/view-components.mjs';

    export let stores;

    const viewComponents = new ViewComponents();

    // ROLLUP IMPORT VIEW COMPONENTS signin/SSOError.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
