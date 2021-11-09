const routes = {
    account: require('./routes/account.js'),
    visualizations: require('./routes/visualizations.js'),
    folders: require('./routes/folders.js'),
    'plugin/login-tokens': require('./routes/plugins/login-tokens.js'),
    'plugin/oembed': require('./routes/plugins/oembed.js'),
    plugin: require('./routes/plugins/publish-s3.js')
};

module.exports = {
    name: '@datawrapper/plugin-api-v1',
    version: '1.0.0',
    register(server) {
        for (const [prefix, route] of Object.entries(routes)) {
            server.register(route, {
                routes: {
                    prefix: `/api-v1/${prefix}`
                }
            });
        }
    }
};
