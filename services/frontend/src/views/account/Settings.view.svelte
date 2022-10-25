<script>
    import Context from '../../utils/svelte-view/Context.svelte';
    import View from './Settings.svelte';

    export let stores;

    const viewComponents = new Map();

    // ROLLUP IMPORT VIEW COMPONENTS account/Settings.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
