module.exports = {
    name: 'routes/team/index',
    version: '1.0.0',
    register: async server => {
        await server.register(require('./{teamId}/index.js'), {
            routes: {
                prefix: '/{teamId}'
            }
        });
    }
};
