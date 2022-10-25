<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { getContext } from 'svelte';
    import { patch } from '@datawrapper/shared/httpReq.js';
    import truncate from '@datawrapper/shared/truncate.js';

    export let __;

    const user = getContext('user');

    async function select(team) {
        await patch('/v3/me/settings', {
            payload: {
                activeTeam: team ? team.id : null
            }
        });
        $user.activeTeam = team;
        $user.teams.forEach(t => {
            t.active = team && t.id === team.id;
        });
        $user = $user;
    }
</script>

<style>
    .team-select.is-active-team {
        cursor: default;
    }
    .team-select.is-active-team :global(.icon) {
        background: var(--color-dw-scooter-lightest);
    }
</style>

<div style="max-height: calc(100vh - 330px); overflow-y:auto">
    {#if $user.teams && $user.teams.length}
        {#each $user.teams as team}
            <a
                href="#/select-team/{team.id}"
                class="navbar-item team-select has-text-weight-normal"
                class:is-active-team={team.active}
                on:click|preventDefault={() => select(team)}
            >
                <IconDisplay
                    className={team.active ? '' : 'has-text-grey-light'}
                    icon="team{team.active ? '-check' : ''}"
                    size="20px"
                />
                <span class="navbar-title">{truncate(team.name)}</span>
            </a>
        {/each}
        <a
            href="#/select-team/none"
            on:click|preventDefault={() => select(null)}
            class="navbar-item team-select has-text-weight-normal"
            class:is-active-team={!$user.activeTeam}
        >
            <IconDisplay
                className={!$user.activeTeam ? '' : 'has-text-grey-light'}
                icon="user{!$user.activeTeam ? '-check' : ''}"
                size="20px"
            />
            <span class="navbar-title">{@html __('navbar / teams / no-team')}</span>
        </a>
    {:else}
        <a class="navbar-item has-text-weight-normal" href="/account/teams">
            {__('account / my-teams / create')}
        </a>
    {/if}
</div>
