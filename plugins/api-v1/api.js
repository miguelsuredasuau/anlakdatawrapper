const routes = {
    account: require('./src/api/routes/account.js'),
    visualizations: require('./src/api/routes/visualizations.js'),
    folders: require('./src/api/routes/folders.js'),
    teams: require('./src/api/routes/teams.js'),
    charts: require('./src/api/routes/charts'),
    'plugin/login-tokens': require('./src/api/routes/plugins/login-tokens.js'),
    'plugin/oembed': require('./src/api/routes/plugins/oembed.js'),
    plugin: require('./src/api/routes/plugins/publish-s3.js')
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
