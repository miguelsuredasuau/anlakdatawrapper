const Joi = require('joi');

module.exports = {
    name: 'routes/account/settings',
    version: '1.0.0',
    register: async server => {
        server.methods.registerSettingsPage('account', request => {
            const __ = server.methods.getTranslate(request);
            return {
                url: '/account/profile',
                title: __('account / profile'),
                group: __('account / settings / personal'),
                svgIcon: 'user',
                svelte2: {
                    id: 'svelte/account/profile',
                    js: '/static/js/svelte/account/profile.js',
                    css: '/static/css/svelte/account/profile.css'
                },
                data: {},
                order: 2
            };
        });

        server.methods.registerSettingsPage('account', request => {
            const __ = server.methods.getTranslate(request);
            return {
                url: '/account/myteams',
                title: __('account / my-teams'),
                group: __('account / settings / personal'),
                svgIcon: 'team',
                svelte2: {
                    id: 'svelte/account/teams',
                    js: '/static/js/svelte/account/myteams.js',
                    css: '/static/css/svelte/account/myteams.css'
                },
                data: {},
                order: 4
            };
        });

        server.route({
            method: 'GET',
            path: '/{pageId?}',
            options: {
                validate: {
                    params: Joi.object({
                        pageId: Joi.string()
                            .alphanum()
                            .invalid('activate', 'invite', 'reset-password')
                    })
                },
                async handler(request, h) {
                    const user = request.auth.artifacts;
                    const settingsPages = await server.methods.getSettingsPages('account', request);
                    const __ = server.methods.getTranslate(request);

                    if (user.teams.length > 0) {
                        // add group with links to team settings pages
                        settingsPages.push({
                            title: __('account / settings / team'),
                            pages: user.teams.map(team => ({
                                url: `/team/${team.id}/settings`,
                                title: team.name,
                                svgIcon: 'team'
                            }))
                        });
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
