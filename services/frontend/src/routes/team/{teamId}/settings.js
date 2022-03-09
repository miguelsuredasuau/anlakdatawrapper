const Joi = require('joi');
const Boom = require('@hapi/boom');
const get = require('lodash/get');

function getSystemDefaultTheme(config) {
    return get(config, 'general.defaults.theme') || 'default';
}

async function getFolders({ team, __ }) {
    const folders = [
        {
            value: null,
            label: __('teams / defaults / none')
        }
    ];
    for (const folder of await team.getFolders()) {
        folders.push({
            value: folder.id,
            label: folder.name
        });
    }
    return folders;
}

function getLocales(config) {
    return (config.general?.locales || []).map(({ id, title }) => ({
        value: id,
        label: `${title} (${id})`
    }));
}

async function getThemes({ Team, Theme, db, config, team }) {
    const publicThemeIds = config.general?.defaultThemes ?? ['default'];
    return (
        await Theme.findAll({
            attributes: ['id', 'title'],
            include: {
                model: Team,
                attributes: ['id']
            },
            where: {
                [db.Op.or]: [{ '$teams.id$': team.id }, { id: publicThemeIds }]
            }
        })
    ).map(theme => ({ value: theme.id, label: theme.title }));
}

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

        server.methods.registerSettingsPage('team', async request => {
            const __ = server.methods.getTranslate(request);
            const { teamId } = request.params;
            const user = request.auth.artifacts;
            // TODO: when moving this view to the new frontend server we need
            // to move the custom-field logic + ui to the team-custom-fields plugin
            // therefor the /team/archive settings page needs to dispatch an event
            // using which plugins can add "sections" to the archive setting page
            const customFieldsEnabled = await user.mayUsePlugin('team-custom-fields');
            return {
                id: 'archive',
                url: `/team/${teamId}/archive`,
                title: __('teams / tab / archive'),
                headline: __('teams / archive / h1'),
                group: __('teams / group / users'),
                svgIcon: 'cabinet',
                svelte2: {
                    id: 'svelte/team-settings/archive',
                    js: '/static/js/svelte/team-settings/archive.js',
                    css: '/static/css/svelte/team-settings/archive.css'
                },
                data: {
                    customFieldsEnabled
                },
                order: 15
            };
        });

        server.methods.registerSettingsPage('team', request => {
            const __ = server.methods.getTranslate(request);
            const { teamId } = request.params;
            return {
                id: 'delete',
                url: `/team/${teamId}/delete`,
                title: __('teams / tab / deleteTeam'),
                group: null,
                svgIcon: 'close',
                svelte2: {
                    id: 'svelte/team-settings/delete',
                    js: '/static/js/svelte/team-settings/delete.js',
                    css: '/static/css/svelte/team-settings/delete.css'
                },
                data: {},
                order: 999
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

        server.methods.registerSettingsPage('team', request => {
            const __ = server.methods.getTranslate(request);
            const { teamId } = request.params;
            return {
                id: 'download',
                url: `/team/${teamId}/download`,
                title: __('teams / tab / download'),
                headline: __('teams / download / h1'),
                group: __('teams / group / publishing'),
                svgIcon: 'file-download',
                svelte2: {
                    id: 'svelte/team-settings/download',
                    js: '/static/js/svelte/team-settings/download.js',
                    css: '/static/css/svelte/team-settings/download.css'
                },
                data: {},
                order: 25
            };
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
                    const isAdmin = auth.artifacts.role === 'admin';

                    if (!isAdmin && !auth.artifacts.teams.find(t => t.id === params.teamId)) {
                        throw Boom.notFound();
                    }

                    const Theme = server.methods.getModel('theme');
                    const __ = server.methods.getTranslate(request);
                    const config = server.methods.config();
                    const db = server.methods.getDB();

                    const team = await Team.findByPk(teamId);

                    if (!team) throw Boom.notFound();

                    if (!team.default_theme) team.default_theme = getSystemDefaultTheme(config);

                    const settingsPages = await server.methods.getSettingsPages('team', request);

                    return h.view('team/Settings.svelte', {
                        htmlClass: 'has-background-white-bis',
                        props: {
                            folders: await getFolders({ team, __ }),
                            locales: getLocales(config),
                            settingsPages,
                            storeData: {
                                role: isAdmin
                                    ? 'owner'
                                    : auth.artifacts.teams.find(t => t.id === teamId).user_team
                                          .team_role
                            },
                            team,
                            themes: await getThemes({ Team, Theme, config, db, team })
                        }
                    });
                }
            }
        });
    }
};
