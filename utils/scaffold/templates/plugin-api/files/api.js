const { version, name } = require('./package.json');

module.exports = {
    name,
    version,
    register: (server, options) => {
        const { events, event } = server.app;
        const { config, models } = options;

        /*
         * example code for adding a new API route
         */
        server.route({
            // route signature
            method: 'GET',
            path: '/plugins/hello',
            // only add api tag if you want to officially document this route
            // config: { tags: ['api'] },
            handler: (request, h) => {
                return h.response('Hello world').header('Content-Type', 'text/plain');
            }
        });

        /*
         * example code for hooking into a server event
         */
        events.on(event.PUBLISH_CHART, async ({ chart }) => {
            // you can use `config` to access the plugin config section inside
            // the global `config.js`
            if (config.isEnabled) {
                // you can use `models` to access ORM classes that make
                // it easy to query information from and to our database
                const { ChartPublic } = models;

                // do something here!
                await ChartPublic.findByPk(chart.id);
            }
        });
    }
};
