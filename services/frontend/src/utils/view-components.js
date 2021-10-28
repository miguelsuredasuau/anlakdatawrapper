module.exports = {
    name: 'view-components',
    version: '1.0.0',
    async register(server) {
        server.app.viewComponents = new Set();

        server.method('registerViewComponent', component => {
            server.app.viewComponents.add(component);
        });

        server.method('getViewComponents', page => {
            return Array.from(server.app.viewComponents).filter(
                component => component.page === page
            );
        });
    }
};
