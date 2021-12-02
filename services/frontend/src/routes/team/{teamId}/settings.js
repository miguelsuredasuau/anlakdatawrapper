const Joi = require('joi');
const Boom = require('@hapi/boom');

module.exports = {
    name: 'routes/team/settings',
    version: '1.0.0',
    register: async server => {
        const Team = server.methods.getModel('team');

        server.methods.registerSettingsPage('team', request => {
            const __ = server.methods.getTranslate(request);
            const { teamId } = request.params;
            return {
                id: 'settings',
                url: `/team/${teamId}/settings`,
                title: __('teams / tab / settings'),
                headline: __('teams / defaults / h1'),
                group: __('teams / group / users'),
                svgIcon: 'settings',
                svelte2: {
                    id: 'svelte/team-settings/settings',
                    js: '/static/js/svelte/team-settings/settings.js',
                    css: '/static/css/svelte/team-settings/settings.css'
                },
                data: {},
                order: 2
            };
        });

        server.methods.registerSettingsPage('team', request => {
            const __ = server.methods.getTranslate(request);
            const { teamId } = request.params;
            return {
                id: 'members',
                url: `/team/${teamId}/members`,
                title: __('teams / tab / members'),
                headline: __('teams / h1'),
                group: __('teams / group / users'),
                svgIcon: 'team',
                svelte2: {
                    id: 'svelte/team-settings/members',
                    js: '/static/js/svelte/team-settings/members.js',
                    css: '/static/css/svelte/team-settings/members.css'
                },
                data: {
                    isAdmin: request.auth.artifacts.role === 'admin'
                },
                order: 10
            };
        });

        server.methods.registerSettingsPage('team', request => {
            const __ = server.methods.getTranslate(request);
            const { teamId } = request.params;
            return {
                id: 'delete',
                url: `/team/${teamId}/delete`,
                title: __('teams / tab / deleteTeam'),
                group: __('teams / group / advanced'),
                svgIcon: 'close',
                svelte2: {
                    id: 'svelte/team-settings/delete',
                    js: '/static/js/svelte/team-settings/delete.js',
                    css: '/static/css/svelte/team-settings/delete.css'
                },
                data: {},
                order: 20
            };
        });

        server.methods.registerSettingsPage('team', request => {
            const __ = server.methods.getTranslate(request);
            const { teamId } = request.params;
            const isAdmin = request.auth.artifacts.role === 'admin';
            return (
                isAdmin && {
                    id: 'products',
                    url: `/team/${teamId}/products`,
                    title: __('teams / tab / adminProducts'),
                    group: __('teams / group / internal'),
                    svgIcon: 'product-management',
                    svelte2: {
                        id: 'svelte/team-settings/products',
                        js: '/static/js/svelte/team-settings/products.js',
                        css: '/static/css/svelte/team-settings/products.css'
                    },
                    data: {
                        isAdmin
                    },
                    order: 30
                }
            );
        });

        server.methods.prepareView('team/Settings.svelte');

        server.route({
            method: 'GET',
            path: '/{pageId}',
            options: {
                validate: {
                    params: Joi.object({
                        teamId: Joi.string().required(),
                        pageId: Joi.string().invalid('invite')
                    })
                },
                async handler(request, h) {
                    const { auth, params } = request;
                    const { teamId } = params;

                    if (!auth.artifacts.teams.find(t => t.id === params.teamId)) {
                        throw Boom.notFound();
                    }

                    const team = await Team.findByPk(teamId);
                    const settingsPages = await server.methods.getSettingsPages('team', request);

                    return h.view('team/Settings.svelte', {
                        htmlClass: 'has-background-white-bis',
                        props: {
                            team,
                            storeData: {
                                role: auth.artifacts.teams.find(t => t.id === teamId).user_team
                                    .team_role
                            },
                            settingsPages
                        }
                    });
                }
            }
        });
    }
};
