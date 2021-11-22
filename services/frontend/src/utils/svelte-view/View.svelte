<script>
    import Context from './Context.svelte';
    import View from '__view__';

    export let stores = {};

    // register view components, which are injected via rollup at SSR runtime
    // by replacing the IMPORT_VIEW_COMP... line below
    const viewComponents = new Map();
    // eslint-disable-next-line no-undef
    IMPORT_VIEW_COMPONENTS;

    export function getValue(key) {
        return view[key];
    }

    let view;
</script>

<Context view={View} bind:this={view} {stores} {viewComponents} {...$$restProps} />
