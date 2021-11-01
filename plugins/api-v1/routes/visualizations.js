const Boom = require('@hapi/boom');

module.exports = {
    name: 'api-v1/visualizations',
    register: async server => {
        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: false
            },
            handler() {
                return {
                    status: 'ok',
                    data: Array.from(server.app.visualizations.values())
                };
            }
        });

        server.route({
            method: 'GET',
            path: '/{id}',
            options: {
                auth: false
            },
            handler(request, h) {
                const vis = server.app.visualizations.get(request.params.id);
                if (!vis) return Boom.notFound();

                return h.response({
                    status: 'ok',
                    data: vis
                });
            }
        });
    }
};
