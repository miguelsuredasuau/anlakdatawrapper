<script>
    import Context from '_utils/svelte-view/Context.svelte';
    import View from './HelloWorld.svelte';
    import { ViewComponents } from '_utils/view-components.mjs';

    export let stores;

    const viewComponents = new ViewComponents();

    // ROLLUP IMPORT VIEW COMPONENTS HelloWorld.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
