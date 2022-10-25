<script>
    import Context from '../../utils/svelte-view/Context.svelte';
    import View from './Invite.svelte';

    export let stores;

    const viewComponents = new Map();

    // ROLLUP IMPORT VIEW COMPONENTS account/Invite.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
