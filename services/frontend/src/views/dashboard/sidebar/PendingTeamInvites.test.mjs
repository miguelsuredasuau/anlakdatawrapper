/* eslint-disable no-unused-expressions */
import PendingTeamInvites from './PendingTeamInvites.svelte';
import { renderWithContext, setConfig } from '../../../test-utils';
import translate from '../../../utils/translate.mjs';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';

setConfig({ testIdAttribute: 'data-uid' });

chai.use(chaiDom);

const uid = 'invite';

const core = {
    'dashboard / checks / pending-team-invites / invite':
        'The user <tt>%user%</tt> has invited you to join the team <b>"%team_name%"</b>!',
    'dashboard / checks / pending-team-invites / invite-without-user':
        'You’ve been invited to join the team <b>"%team_name%"</b>!',
    'dashboard / checks / pending-team-invites / accept': 'Accept invitation',
    'dashboard / checks / pending-team-invites / reject': 'reject it'
};

const __ = (key, scope, replacements) => translate(key, scope, { core }, replacements);

describe('PendingTeamInvites', () => {
    describe('Invite with inviting user email address', function () {
        it('renders invite text with user email address', async () => {
            const result = await renderWithContext(PendingTeamInvites, {
                pendingTeams: [
                    {
                        id: 'SOME_TEAM_ID',
                        name: 'Dream Team',
                        token: 'SOME_TOKEN',
                        invitedBy: { name: 'scottie.pippen@example.com' }
                    }
                ],
                __,
                uid
            });
            const message = result.getByTestId('invite-message');
            expect(message).to.exist;
            expect(message).to.have.text(
                'The user scottie.pippen@example.com has invited you to join the team "Dream Team"!'
            );
        });

        it('renders multiple invites with email addresses', async () => {
            const result = await renderWithContext(PendingTeamInvites, {
                pendingTeams: [
                    {
                        id: 'SOME_TEAM_ID',
                        name: 'Chicago Bulls',
                        token: 'SOME_TOKEN',
                        invitedBy: { name: 'scottie.pippen@example.com' }
                    },
                    {
                        id: 'SOME_OTHER_TEAM_ID',
                        name: 'Charlotte Hornets',
                        token: 'SOME_OTHER_TOKEN',
                        invitedBy: { name: 'michael.jordan@example.com' }
                    }
                ],
                __,
                uid
            });
            const messages = result.queryAllByTestId('invite-message');
            expect(messages).to.have.lengthOf(2);
            expect(messages[0]).to.have.text(
                'The user scottie.pippen@example.com has invited you to join the team "Chicago Bulls"!'
            );
            expect(messages[1]).to.have.text(
                'The user michael.jordan@example.com has invited you to join the team "Charlotte Hornets"!'
            );
        });
    });

    describe('Invite with inviting user name & URL', function () {
        it('renders invite text with user name and text', async () => {
            const result = await renderWithContext(PendingTeamInvites, {
                pendingTeams: [
                    {
                        id: 'SOME_TEAM_ID',
                        name: 'Dream Team',
                        token: 'SOME_TOKEN',
                        invitedBy: {
                            name: 'Scottie Pippen',
                            url: 'https://twitter.com/ScottiePippen'
                        }
                    }
                ],
                __,
                uid
            });
            const message = result.getByTestId('invite-message');
            expect(message).to.exist;
            expect(message).to.have.text(
                'The user Scottie Pippen has invited you to join the team "Dream Team"!'
            );
            expect(message.querySelector('a')).to.have.attribute(
                'href',
                'https://twitter.com/ScottiePippen'
            );
        });
    });

    describe('Invite without inviting user (because DELETED)', function () {
        it('does not render the invite', async () => {
            const result = await renderWithContext(PendingTeamInvites, {
                pendingTeams: [
                    {
                        id: 'SOME_TEAM_ID',
                        name: 'Dream Team',
                        token: 'SOME_TOKEN',
                        invitedBy: null
                    }
                ],
                __,
                uid
            });
            const invite = result.queryByTestId('invite');
            expect(invite).to.not.exist;
        });
    });

    describe('Team actions', function () {
        let result;
        beforeEach(async () => {
            result = await renderWithContext(PendingTeamInvites, {
                pendingTeams: [
                    {
                        id: 'dream_team',
                        name: 'Dream Team',
                        token: 'TOKEN_XYZ',
                        invitedBy: { name: 'scottie.pippen@example.com' }
                    }
                ],
                __,
                uid
            });
        });

        it('provide a link for accepting the invite', () => {
            const acceptLink = result.getByTestId('invite-accept');
            expect(acceptLink).to.have.text('Accept invitation');
            expect(acceptLink).to.have.attribute(
                'href',
                '/team/dream_team/invite/TOKEN_XYZ/accept'
            );
        });

        it('provide a link for rejecting the invite', () => {
            const rejectLink = result.getByTestId('invite-reject');
            expect(rejectLink).to.have.text('reject it');
            expect(rejectLink).to.have.attribute(
                'href',
                '/team/dream_team/invite/TOKEN_XYZ/reject'
            );
        });
    });
});
