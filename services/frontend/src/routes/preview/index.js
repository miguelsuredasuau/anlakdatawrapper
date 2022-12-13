module.exports = {
    name: 'routes/preview',
    version: '1.0.0',
    register: async server => {
        await server.register(require('./{chartId}/index.js'), {
            routes: {
                prefix: '/{chartId}'
            }
        });
    }
};
