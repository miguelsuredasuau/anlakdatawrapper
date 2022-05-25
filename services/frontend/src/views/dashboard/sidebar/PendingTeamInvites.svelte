<script>
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import truncate from '@datawrapper/shared/truncate.js';
    import IconBox from '_partials/displays/IconBox.svelte';

    export let pendingTeams;
    export let __;

    function getMessage(teamName, user) {
        const userName = truncate(purifyHtml(user.name, ''), 15, 15);
        let url = false;
        if (user.url) {
            try {
                const parsed = new URL(user.url);
                url = parsed.href;
            } catch (e) {
                url = false;
            }
        }
        return __('dashboard / checks / pending-team-invites / invite')
            .replace('%team_name%', `${truncate(purifyHtml(teamName, ''))}`)
            .replace('%user%', url ? `<a href="${url}" target="_blank">${userName}</a>` : userName);
    }
</script>

<style>
    .reject {
        display: inline-block;
    }

    .reject a {
        color: inherit;
        text-decoration: underline;
    }

    .invite-msg :global(tt),
    .invite-msg :global(tt a) {
        font-size: 13px;
        color: var(--color-dw-red);
    }
</style>

{#if pendingTeams}
    {#each pendingTeams as team}
        <IconBox icon="team">
            <span slot="title">
                {__('dashboard / checks / pending-team-invites / title')}
            </span>

            <p class="invite-msg pb-4">{@html getMessage(team.name, team.invitedBy)}</p>

            <a class="button is-primary" href="/team/{team.id}/invite/{team.token}/accept">
                {__('dashboard / checks / pending-team-invites / accept')}
            </a>

            <span class="reject pt-2 pl-1 has-text-grey-dark">
                &nbsp;{__('account / or')}
                <a href="/team/{team.id}/invite/{team.token}/reject">
                    {__('dashboard / checks / pending-team-invites / reject')}
                </a>
            </span>
        </IconBox>
    {/each}
{/if}
