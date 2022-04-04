const groupBy = require('lodash/groupBy');

module.exports = {
    name: 'utils/demo-datasets',
    version: '1.0.0',
    async register(server) {
        /**
         * allow plugins to register demo datasets
         */
        const demoDatasetHandlers = new Set();
        server.method('registerDemoDatasets', handler => {
            demoDatasetHandlers.add(handler);
        });

        /**
         * return registered demo datasets
         */
        server.method('getDemoDatasets', async ({ chart, request }) => {
            const __ = server.methods.getTranslate(request);
            // load demo datasets
            let datasets = [];
            for (const handler of demoDatasetHandlers) {
                datasets = [
                    ...datasets,
                    ...(await handler({ request, chart })).map(ds => {
                        return {
                            ...ds,
                            // translate chart type
                            type: __(ds.type.key, ds.type.scope)
                        };
                    })
                ];
            }
            return Object.fromEntries(
                Object.entries(groupBy(datasets, ds => ds.type)).map(([key, values]) => [
                    key,
                    { type: key, datasets: values }
                ])
            );
        });
    }
};
