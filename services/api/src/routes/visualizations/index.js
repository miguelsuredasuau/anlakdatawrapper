const get = require('lodash/get');
const { prepareVisualization, translate } = require('@datawrapper/service-utils');
const clone = require('lodash/cloneDeep');

module.exports = {
    name: 'routes/visualizations',
    version: '1.0.0',
    register(server) {
        server.route({
            method: 'GET',
            path: '/',
            options: {
                description: 'Get list of all available visualization types',
                auth: {
                    mode: 'try',
                    access: { scope: ['visualization:read'] }
                }
            },
            handler: getVisualizations
        });

        function getVisualizations(request) {
            const { server, auth } = request;

            return Array.from(server.app.visualizations.keys())
                .map(key => {
                    const vis = clone(server.app.visualizations.get(key));
                    vis.__title = translate(vis.title, {
                        scope: vis.__plugin,
                        language: get(auth.artifacts, 'language') || 'en-US'
                    });
                    delete vis.defaultMetadata;
                    delete vis.icon;
                    return vis;
                })
                .filter(vis => !vis.hidden)
                .map(prepareVisualization);
        }

        server.register(require('./{id}'), {
            routes: {
                prefix: '/{id}'
            }
        });
    }
};
