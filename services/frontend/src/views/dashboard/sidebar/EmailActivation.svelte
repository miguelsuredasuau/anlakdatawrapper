<script>
    import { getContext } from 'svelte';
    import IconBox from '_partials/displays/IconBox.svelte';
    const user = getContext('user');

    export let __;
</script>

{#if $user && !$user.isActivated && $user.email !== '' && $user.email !== '""'}
    <IconBox icon="warning" iconColor="warning">
        <span slot="title">{__('dashboard / checks / email-activation / heads-up')}</span>
        <p>{__('dashboard / checks / email-activation / confirm')}</p>
    </IconBox>
{/if}
