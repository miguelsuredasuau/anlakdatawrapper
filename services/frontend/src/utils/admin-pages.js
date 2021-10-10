const groupBy = require('lodash/groupBy');

module.exports = {
    name: 'admin-pages',
    version: '1.0.0',
    async register(server) {
        server.app.adminPages = new Set();

        server.method('registerAdminPage', adminPageFunc => {
            server.app.adminPages.add(adminPageFunc);
        });

        server.method('getAdminPages', request => {
            return Object.entries(
                groupBy(
                    Array.from(server.app.adminPages).map(func => func(request)),
                    d => d.group
                )
            )
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

        function byOrder(a, b) {
            return a.order !== undefined && b.order !== undefined ? a.order - b.order : 0;
        }
    }
};
