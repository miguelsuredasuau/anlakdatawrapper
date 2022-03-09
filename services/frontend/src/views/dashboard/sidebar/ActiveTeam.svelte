<script>
    import { getContext } from 'svelte';
    import IconBox from '_partials/displays/IconBox.svelte';

    const user = getContext('user');

    export let __;

    $: teamRole = $user.activeTeam ? $user.activeTeam.user_team.team_role : null;
</script>

{#if $user && $user.activeTeam}
    <IconBox icon="team">
        <a slot="title" href="/archive/team/{$user.activeTeam.id}/">{$user.activeTeam.name}</a>
        {@html __('dashboard / see-team-charts').replace('%teamId%', $user.activeTeam.id)}
        {#if teamRole === 'owner' || teamRole === 'admin'}
            {@html __('dashboard / manage-team-settings').replace(
                '%teamId%',
                $user.activeTeam.id
            )}{/if}.
    </IconBox>
{/if}
