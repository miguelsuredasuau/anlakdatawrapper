const groupBy = require('lodash/groupBy');
const { byOrder } = require('.');

module.exports = {
    name: 'settings-pages',
    version: '1.0.0',
    async register(server) {
        server.app.settingsPages = new Map();

        server.method('registerSettingsPage', (settingsKey, settingsPageFunc) => {
            if (!server.app.settingsPages.has(settingsKey)) {
                server.app.settingsPages.set(settingsKey, new Set());
            }
            server.app.settingsPages.get(settingsKey).add(settingsPageFunc);
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
            const pages = [];
            for (const pageFunc of server.app.settingsPages.get(settingsKey)) {
                const page = await pageFunc(request);
                if ((page && !filter) || filter(page)) pages.push(page);
            }
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
