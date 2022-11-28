<script>
    import Context from '../../utils/svelte-view/Context.svelte';
    import View from './Index.svelte';
    import { ViewComponents } from '_utils/view-components.mjs';

    export let stores;

    const viewComponents = new ViewComponents();

    // ROLLUP IMPORT VIEW COMPONENTS admin/Index.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
