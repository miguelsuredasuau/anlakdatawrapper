<script>
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import IconBox from '_partials/displays/IconBox.svelte';

    export let pendingTeams;
    export let __;

    function getMessage(name) {
        return __('dashboard / checks / pending-team-invites / invite').replace(
            '%team_name%',
            name
        );
    }
</script>

<style>
    .reject {
        color: gray;
        display: inline-block;
    }

    .reject a {
        color: inherit;
        text-decoration: underline;
    }
</style>

{#if pendingTeams}
    {#each pendingTeams as team}
        <IconBox icon="team">
            <span slot="title">
                {__('dashboard / checks / pending-team-invites / title')}
            </span>

            <p class="pb-4">{@html purifyHtml(getMessage(team.name))}</p>

            <a class="button is-primary" href="/team/{team.id}/invite/{team.token}/accept">
                {__('dashboard / checks / pending-team-invites / accept')}
            </a>

            <span class="reject pt-2 pl-1">
                &nbsp;{__('account / or')}
                <a href="/team/{team.id}/invite/{team.token}/reject">
                    {__('dashboard / checks / pending-team-invites / reject')}
                </a>
            </span>
        </IconBox>
    {/each}
{/if}
