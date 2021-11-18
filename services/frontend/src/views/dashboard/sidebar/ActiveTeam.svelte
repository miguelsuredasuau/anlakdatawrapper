<script>
    import { getContext } from 'svelte';
    import IconBox from '_partials/displays/IconBox.svelte';
    const user = getContext('user');
</script>

{#if $user && $user.activeTeam}
    <IconBox icon="team">
        <a slot="title" href="/archive/team/{$user.activeTeam.id}/">{$user.activeTeam.name}</a>
        See your&nbsp;<a href="/archive/team/{$user.activeTeam.id}/">team charts</a>
    </IconBox>
{/if}
