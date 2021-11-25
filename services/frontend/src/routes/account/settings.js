const Joi = require('joi');

module.exports = {
    name: 'routes/account/settings',
    version: '1.0.0',
    register: async server => {
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
                svgIcon: 'user',
                svelte2: {
                    id: 'svelte/account/profile',
                    js: '/static/js/svelte/account/profile.js',
                    css: '/static/css/svelte/account/profile.css'
                },
                data: {
                    email: request.auth.artifacts.email,
                    emailChanged
                },
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

        server.methods.registerSettingsPage('account', request => {
            const __ = server.methods.getTranslate(request);
            const isAdmin = request.auth.artifacts.role === 'admin';
            return (
                isAdmin && {
                    url: '/account/security',
                    title: 'Security',
                    group: __('account / settings / personal'),
                    svgIcon: 'privacy',
                    svelte2: {
                        id: 'svelte/account/security',
                        js: '/static/js/svelte/account/security.js',
                        css: '/static/css/svelte/account/security.css'
                    },
                    data: {},
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
