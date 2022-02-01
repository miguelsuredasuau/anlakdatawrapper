const groupBy = require('lodash/groupBy');
const { byOrder } = require('.');

module.exports = {
    name: 'settings-pages',
    version: '1.0.0',
    async register(server) {
        server.app.settingsPages = new Map();

        server.method('registerSettingsPage', (settingsKey, settingsPageFunc) => {
            if (!server.app.settingsPages.has(settingsKey)) {
                server.app.settingsPages.set(settingsKey, {
                    pageFuncs: new Set(),
                    sectionFuncs: new Set()
                });
            }
            server.app.settingsPages.get(settingsKey).pageFuncs.add(settingsPageFunc);
        });

        server.method('registerSettingsSection', (settingsKey, settingsSectionFunc) => {
            if (!server.app.settingsPages.has(settingsKey)) {
                server.app.settingsPages.set(settingsKey, {
                    pageFuncs: new Set(),
                    sectionFuncs: new Set()
                });
            }
            server.app.settingsPages.get(settingsKey).sectionFuncs.add(settingsSectionFunc);
        });

        /**
         * retrieve grouped settings pages for a given request
         *
         * @param settingsKey - key of settings page (e.g. account, team, admin)
         * @param request     - current requests
         * @param filter      - an optional filter function
         */
        server.method('getSettingsPages', async (settingsKey, request, filter = null) => {
            if (!server.app.settingsPages.has(settingsKey)) {
                return [];
            }
            const { pageFuncs, sectionFuncs } = server.app.settingsPages.get(settingsKey);

            const pages = [];
            for (const pageFunc of pageFuncs) {
                const page = await pageFunc(request);
                if (page && (!filter || filter(page))) pages.push(page);
            }

            const sections = [];
            for (const sectionFunc of sectionFuncs) {
                const section = await sectionFunc(request);
                if (section) sections.push(section);
            }

            pages.forEach(
                page =>
                    (page.sections = sections
                        .filter(section => section.pageId === page.id)
                        .sort(byOrder))
            );

            return Object.entries(groupBy(pages, 'group'))
                .map(([title, pages]) => {
                    return {
                        title,
                        pages: pages.sort(byOrder)
                    };
                })
                .sort((a, b) => {
                    return byOrder(a.pages[0] || {}, b.pages[0] || {});
                });
        });

        // convenience wrappers for admin pages
        server.method('registerAdminPage', adminPageFunc => {
            server.methods.registerSettingsPage('admin', adminPageFunc);
        });

        server.method('getAdminPages', request => {
            return server.methods.getSettingsPages('admin', request);
        });
    }
};
