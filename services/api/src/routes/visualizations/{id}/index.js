const Boom = require('@hapi/boom');
const get = require('lodash/get');
const { translate } = require('@datawrapper/service-utils/l10n');
const prepareVisualization = require('@datawrapper/service-utils/prepareVisualization');

module.exports = {
    name: 'routes/visualizations/{id}',
    version: '1.0.0',
    register
};

async function register(server, options) {
    server.app.scopes.add('visualization:read');

    server.route({
        method: 'GET',
        path: '/',
        options: {
            description: 'Get information about a visualization type',
            auth: {
                mode: 'try',
                access: { scope: ['visualization:read'] }
            }
        },
        handler: getVisualization
    });

    async function getVisualization(request, h) {
        const { params, server, auth } = request;

        const vis = server.app.visualizations.get(params.id);
        if (!vis) return Boom.notFound();

        // also include translated title
        vis.__title = translate(vis.title, {
            scope: vis.__plugin,
            language: get(auth.artifacts, 'language') || 'en-US'
        });

        return h.response(prepareVisualization(vis));
    }

    require('./styles')(server, options);
    require('./script')(server, options);
}
