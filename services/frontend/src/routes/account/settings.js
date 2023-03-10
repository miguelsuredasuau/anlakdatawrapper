const Joi = require('joi');
const { SQ } = require('@datawrapper/orm');
const keyBy = require('lodash/keyBy');
const groupBy = require('lodash/groupBy');

module.exports = {
    name: 'routes/account/settings',
    version: '1.0.0',
    register: async server => {
        const Chart = server.methods.getModel('chart');
        const UserTeam = server.methods.getModel('user_team');

        server.methods.registerSettingsPage('account', async request => {
            const __ = server.methods.getTranslate(request);
            const user = request.auth.artifacts;
            const { pageId } = request.params;
            const { token } = request.query;
            let emailChanged = false;

            if (pageId === 'profile' && token) {
                // email activation
                const Action = server.methods.getModel('action');
                const t = await Action.findOne({
                    where: {
                        user_id: user.id,
                        key: 'email-change-request'
                    },
                    order: [['action_time', 'DESC']]
                });
                if (t) {
                    // check if token is valid
                    const details = JSON.parse(t.details);
                    if (details.token && details.token === token) {
                        // token matches
                        await user.update({
                            email: details['new-email']
                        });
                        emailChanged = true;
                        // clear token to prevent future changes
                        await t.update({
                            details: JSON.stringify({ ...details, token: '' })
                        });
                    }
                }
            }

            return {
                url: '/account/profile',
                title: __('account / profile'),
                headline: __('Edit profile'),
                group: __('account / settings / personal'),
                svgIcon: 'user-menu',
                svelte2: {
                    id: 'svelte/account/profile',
                    js: '/lib/static/js/svelte2/account/profile.js',
                    css: '/lib/static/css/svelte2/account/profile.css'
                },
                data: {
                    email: request.auth.artifacts.email,
                    emailChanged
                },
                order: 2
            };
        });

        server.methods.registerSettingsPage('account', async request => {
            const __ = server.methods.getTranslate(request);
            const user = request.auth.artifacts;
            const teams = (await user.getAcceptedTeams()).map(t => ({ ...t.toJSON() }));

            const chartCount = keyBy(
                await Chart.count({
                    where: {
                        deleted: false,
                        organization_id: teams.map(t => t.id)
                    },
                    group: ['organization_id']
                }),
                'organization_id'
            );

            const userCount = groupBy(
                await UserTeam.count({
                    where: {
                        organization_id: teams.map(t => t.id)
                    },
                    group: [
                        'organization_id',
                        [SQ.literal("invite_token = '' OR invite_token is NULL"), 'emptyInvite']
                    ]
                }),
                'organization_id'
            );

            teams.forEach(team => {
                team.role = team.user_team.team_role;
                team.charts = chartCount[team.id]?.count || 0;
                team.members = userCount[team.id].find(d => d.emptyInvite === 1).count;
                team.invites = userCount[team.id].find(d => d.emptyInvite === 0)?.count || 0;
            });

            const currentTeam = user.activeTeam ? user.activeTeam.id : null;
            return {
                url: '/account/teams',
                title: __('account / my-teams'),
                headline: __('account / my-teams'),
                group: __('account / settings / personal'),
                svgIcon: 'team',
                svelte2: {
                    id: 'svelte/account/myteams',
                    js: '/lib/static/js/svelte2/account/myteams.js',
                    css: '/lib/static/css/svelte2/account/myteams.css'
                },
                data: {
                    currentTeam,
                    teams,
                    user: {
                        id: user.id,
                        isAdmin: user.role === 'admin'
                    }
                },
                order: 4
            };
        });

        server.methods.registerSettingsPage('account', request => {
            const __ = server.methods.getTranslate(request);
            const isAdmin = request.auth.artifacts.role === 'admin';
            const user = request.auth.artifacts;

            return (
                isAdmin && {
                    url: '/account/security',
                    title: 'Security',
                    group: __('account / settings / personal'),
                    svgIcon: 'lock',
                    svelte2: {
                        id: 'svelte/account/security',
                        js: '/lib/static/js/svelte2/account/security.js',
                        css: '/lib/static/css/svelte2/account/security.css'
                    },
                    data: {
                        user: {
                            email: user.email,
                            name: user.name
                        }
                    },
                    order: 20
                }
            );
        });

        server.route({
            method: 'GET',
            path: '/{pageId?}',
            options: {
                validate: {
                    params: Joi.object({
                        pageId: Joi.string().invalid('activate', 'invite', 'reset-password')
                    }),
                    query: Joi.object({
                        token: Joi.string()
                    })
                },
                async handler(request, h) {
                    const user = request.auth.artifacts;
                    const isAdmin = user.role === 'admin';
                    const settingsPages = await server.methods.getSettingsPages('account', request);
                    const __ = server.methods.getTranslate(request);
                    const userTeams = await user.getAcceptedTeams();

                    if (userTeams.length > 0) {
                        const teamSettingsPages = userTeams
                            .filter(team => {
                                if (isAdmin) return true;
                                const roleInTeam = user.teams.find(t => t.id === team.id).user_team
                                    .team_role;
                                return ['owner', 'admin'].includes(roleInTeam);
                            })
                            .map(team => ({
                                url: `/team/${team.id}/settings`,
                                title: team.name,
                                escape: true,
                                svgIcon: 'team'
                            }));

                        if (teamSettingsPages.length > 0) {
                            settingsPages.push({
                                title: __('account / settings / team'),
                                pages: teamSettingsPages
                            });
                        }
                    }

                    return h.view('account/Settings.svelte', {
                        htmlClass: 'has-background-white-bis',
                        props: {
                            settingsPages
                        }
                    });
                }
            }
        });
    }
};
