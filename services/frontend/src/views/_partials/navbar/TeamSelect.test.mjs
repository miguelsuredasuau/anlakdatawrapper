/* eslint-disable no-unused-expressions */
import TeamSelect from './TeamSelect.svelte';
import { renderWithContext } from '../../../test-utils';
import { fireEvent, waitFor } from '@testing-library/svelte';
import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import nock from 'nock';

chai.use(chaiDom);

const teams = [
    {
        id: 'team-a',
        name: 'A-Team'
    },
    {
        id: 'team-b',
        name: 'B-Team'
    }
];

const defaultUser = {
    id: 2,
    name: 'user@datawrapper.de',
    email: 'user@datawrapper.de',
    language: 'en-US',
    isAdmin: false,
    isGuest: false,
    isActivated: true
};

const messages = {
    'account / my-teams / create': 'Create team',
    'navbar / teams / no-team': 'No team'
};

const __ = d => messages[d] || d;

describe('TeamSelect', () => {
    describe('user has no teams', function () {
        const getResult = () =>
            renderWithContext(
                TeamSelect,
                { __ },
                {
                    user: {
                        ...defaultUser,
                        activeTeam: null,
                        teams: []
                    }
                }
            );

        it('shows no no-team option', async () => {
            const result = await getResult();
            const noTeam = await result.queryByText('No team');
            expect(noTeam).to.not.exist;
        });

        it('shows create-team promo link', async () => {
            const result = await getResult();
            const createTeam = await result.queryByText('Create team');
            expect(createTeam).to.exist;
            expect(createTeam).to.have.attribute('href', '/account/teams');
        });
    });

    describe('user has two teams, none active', function () {
        const getResult = () =>
            renderWithContext(
                TeamSelect,
                { __ },
                {
                    user: {
                        ...defaultUser,
                        activeTeam: null,
                        teams
                    }
                }
            );

        it('shows no-team option and is active', async () => {
            const result = await getResult();
            const noTeam = await result.queryByText('No team');
            expect(noTeam).to.exist;
            expect(noTeam.parentNode).to.have.class('is-active-team');
        });

        it('shows no create-team promo', async () => {
            const result = await getResult();
            const createTeam = await result.queryByText('Create team');
            expect(createTeam).not.to.exist;
        });

        it('shows team options, not active', async () => {
            const result = await getResult();
            const team1 = await result.queryByText('A-Team');
            expect(team1).to.exist;
            expect(team1.parentNode).not.to.have.class('is-active-team');
            const team2 = await result.queryByText('B-Team');
            expect(team2).to.exist;
            expect(team2.parentNode).not.to.have.class('is-active-team');
        });
    });

    describe('user without active team set active team', function () {
        const getResult = () =>
            renderWithContext(
                TeamSelect,
                { __ },
                {
                    user: {
                        ...defaultUser,
                        activeTeam: null,
                        teams
                    }
                }
            );

        window.dw = { backend: { __api_domain: 'http://api.datawrapper.mock' } };

        it('clicking on team-a activates it', async () => {
            const scope = nock('http://api.datawrapper.mock')
                .patch('/v3/me/settings', { activeTeam: 'team-a' })
                .reply(204);
            const result = await getResult();

            const team = await result.queryByText('A-Team');
            expect(team).to.exist;
            expect(scope.isDone()).to.be.false;
            await fireEvent(team, new MouseEvent('click', { bubbles: true }));
            await waitFor(() => expect(scope.isDone()).to.be.true);
        });
    });

    describe('user with active team unset active team', function () {
        const getResult = () =>
            renderWithContext(
                TeamSelect,
                { __ },
                {
                    user: {
                        ...defaultUser,
                        activeTeam: teams[0],
                        teams: [{ ...teams[0], active: true }, teams[1]]
                    }
                }
            );

        window.dw = { backend: { __api_domain: 'http://api.datawrapper.mock' } };

        it('active team is shown as active', async () => {
            const result = await getResult();
            const team = await result.queryByText('A-Team');
            expect(team).to.exist;
            expect(team.parentNode).to.have.class('is-active-team');
        });

        it('clicking on no-team unsets active team', async () => {
            const scope = nock('http://api.datawrapper.mock')
                .patch('/v3/me/settings', { activeTeam: null })
                .reply(204);
            const result = await getResult();

            const noTeam = await result.queryByText('No team');
            expect(noTeam).to.exist;
            expect(scope.isDone()).to.be.false;
            await fireEvent(noTeam, new MouseEvent('click', { bubbles: true }));
            await waitFor(() => expect(scope.isDone()).to.be.true);
        });
    });
});
