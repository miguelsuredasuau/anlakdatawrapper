<script>
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import truncate from '@datawrapper/shared/truncate.js';
    import IconBox from '_partials/displays/IconBox.svelte';

    export let pendingTeams;
    export let __;
    export let uid;

    function getUserDisplay({ name, url }) {
        const userName = truncate(purifyHtml(name, []), 15, 15);
        if (!url) {
            return userName;
        }
        try {
            const { href } = new URL(url);
            return `<a href="${href}" target="_blank">${userName}</a>`;
        } catch (e) {
            return userName;
        }
    }

    function getMessage(team, user) {
        const teamName = truncate(purifyHtml(team, []));
        return __('dashboard / checks / pending-team-invites / invite', 'core', {
            team_name: teamName,
            user: getUserDisplay(user)
        });
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
        {#if team.invitedBy}
            <IconBox icon="team" {uid}>
                <span slot="title">
                    {__('dashboard / checks / pending-team-invites / title')}
                </span>

                <p class="invite-msg pb-4" data-uid={uid && `${uid}-message`}>
                    {@html purifyHtml(getMessage(team.name, team.invitedBy))}
                </p>

                <a
                    class="button is-primary"
                    href="/team/{team.id}/invite/{team.token}/accept"
                    data-uid={uid && `${uid}-accept`}
                >
                    {__('dashboard / checks / pending-team-invites / accept')}
                </a>

                <span class="reject pt-2 pl-1 has-text-grey-dark">
                    &nbsp;{__('account / or')}
                    <a
                        href="/team/{team.id}/invite/{team.token}/reject"
                        data-uid={uid && `${uid}-reject`}
                    >
                        {__('dashboard / checks / pending-team-invites / reject')}
                    </a>
                </span>
            </IconBox>
        {/if}
    {/each}
{/if}
