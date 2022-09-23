const { byOrder } = require('./index');
const { getUserLanguage } = require('@datawrapper/service-utils/l10n');

module.exports = {
    name: 'header-links',
    version: '1.0.0',
    async register(server) {
        server.app.headerLinks = new Set();

        server.method('registerHeaderLinks', headerLinkFunc => {
            server.app.headerLinks.add(headerLinkFunc);
        });

        server.method('getHeaderLinks', async request => {
            const linksById = new Map();
            const links = [];
            const subLinks = [];
            // evaluate links for each request, please use cache!
            for (const func of server.app.headerLinks) {
                const items = await func(request);
                links.push.apply(
                    links,
                    items.filter(i => !i.parent)
                );
                subLinks.push.apply(
                    subLinks,
                    items.filter(i => i.parent)
                );
            }

            // register top-level links by id
            links.forEach(link => {
                if (link.id) {
                    linksById.set(link.id, link);
                }
            });

            subLinks.forEach(link => {
                if (linksById.has(link.parent)) {
                    const parent = linksById.get(link.parent);
                    if (!parent.submenuItems) parent.submenuItems = [];
                    parent.submenuItems.push(link);
                }
            });

            // sort links by order
            return links.sort(byOrder).map(link => {
                // also sort submenu items
                if (Array.isArray(link.submenuItems)) {
                    link.submenuItems = link.submenuItems.sort(byOrder);
                }
                return link;
            });
        });

        const frontendConfig = server.methods.config('frontend');

        // add some core header links
        server.methods.registerHeaderLinks(async request => {
            const user = request.auth.artifacts;
            const isGuest = !user || user.role === 'guest';
            const isAdmin = user && user.role === 'admin';

            const adminPageLinks = [];
            if (isAdmin) {
                let order = 0;
                (await server.methods.getAdminPages(request)).forEach(({ title, pages }) => {
                    order++;
                    adminPageLinks.push({
                        type: 'html',
                        class: 'has-text-grey has-text-weight-medium is-size-7 is-uppercase',
                        content: title,
                        order
                    });
                    pages.sort(byOrder).forEach(page => {
                        if (page.url) {
                            order++;
                            adminPageLinks.push({
                                ...page,
                                data: null,
                                order
                            });
                        }
                    });
                });
            }

            const language = getUserLanguage(request.auth);
            const __ = server.methods.getTranslate(request);

            return [
                ...(!isGuest
                    ? [
                          {
                              id: 'dashboard',
                              class: 'nav-item-dashboard',
                              svgIcon: 'launch',
                              // fontIcon: 'fa fa-fw fa-bar-chart-o',
                              title: __('navbar / dashboard'),
                              url: '/',
                              order: 5
                          }
                      ]
                    : []),
                {
                    id: 'create-new',
                    class: 'nav-item-create-new',
                    svgIcon: 'add',
                    title: `${__('navbar / create-new')} <span class="has-text-grey">…</span>`,
                    order: 10,
                    submenuItems: [
                        {
                            id: 'create-chart',
                            svgIcon: 'dw-chart',
                            title: __('navbar / create / chart'),
                            url: '/create/chart',
                            order: 10
                        },
                        {
                            id: 'create-map',
                            svgIcon: 'dw-map',
                            title: __('navbar / create / map'),
                            url: '/select/map',
                            order: 20
                        },
                        {
                            id: 'create-table',
                            svgIcon: 'dw-table',
                            title: __('navbar / create / table'),
                            url: '/create/table',
                            order: 30
                        },
                        ...(!isGuest
                            ? [
                                  {
                                      type: 'activeTeam',
                                      order: 999
                                  }
                              ]
                            : [])
                    ]
                },

                ...(isGuest
                    ? [
                          {
                              class: 'nav-item-sign-in',
                              svgIcon: 'sign-in',
                              title: 'Sign in',
                              type: 'login',
                              url: `/signin?ref=${request.path}`
                          },
                          {
                              type: 'separator',
                              order: 69
                          }
                      ]
                    : [
                          {
                              id: 'archive',
                              class: 'nav-item-archive',
                              type: 'visArchive',
                              submenuItems: true,
                              order: 61
                          },
                          {
                              type: 'separator',
                              order: 69
                          }
                      ]),
                ...(isAdmin
                    ? [
                          {
                              id: 'admin',
                              class: 'nav-item-admin',
                              fontIcon: 'fa fa-magic',
                              submenuItems: adminPageLinks,
                              order: 90
                          }
                      ]
                    : []),
                {
                    id: 'settings',
                    class: 'nav-item-more',
                    svgIcon: 'menu',
                    title: 'More',
                    order: 95,
                    submenuItems: [
                        ...(!isGuest
                            ? [
                                  {
                                      url: '/account',
                                      title: __('account / settings'),
                                      svgIcon: 'user-menu',
                                      order: 10
                                  },
                                  {
                                      url: '/account/teams',
                                      title: __('account / my-teams'),
                                      svgIcon: 'team',
                                      order: 20
                                  }
                              ]
                            : []),
                        {
                            url: '/account/teams',
                            title: __('Language'),
                            svgIcon: 'globe',
                            order: 30,
                            submenuItems: (frontendConfig.languages || []).map(({ id, title }) => ({
                                id,
                                type: 'language',
                                svgIcon: id === language ? 'check-circle' : 'circle',
                                svgIconClass: id === language ? '' : 'has-text-grey-light',
                                title: `${title}`
                            }))
                        },
                        ...(!isGuest
                            ? [
                                  {
                                      type: 'separator',
                                      order: 50
                                  },
                                  {
                                      type: 'html',
                                      order: 51,
                                      content: `<span class="has-text-grey is-size-7" style="margin-bottom:-.25rem">${__(
                                          'account / my-teams / select-active'
                                      )}</span>`
                                  },
                                  {
                                      type: 'teamSelector',
                                      order: 52
                                  },
                                  {
                                      type: 'separator',
                                      order: 53
                                  },
                                  {
                                      url: '#/logout',
                                      svgIcon: 'sign-out',
                                      type: 'logout',
                                      title: 'Logout',
                                      order: 100
                                  }
                              ]
                            : [])
                    ]
                }
            ];
        });
    }
};
