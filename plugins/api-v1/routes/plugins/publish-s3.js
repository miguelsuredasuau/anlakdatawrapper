const Joi = require('joi');
const get = require('lodash/get');

module.exports = {
    name: 'api-v1/plugins/publish-s3',
    register: async (server, options) => {
        const Chart = server.methods.getModel('chart');

        function getRoute(plugin) {
            return {
                method: 'GET',
                path: `/${plugin}/embed-code/{chartId}`,
                options: {
                    auth: false,
                    validate: {
                        params: Joi.object({
                            chartId: Joi.string()
                            .length(5)
                            .required()
                            .description('5 character long chart ID.')
                        })
                    }
                },
                handler: async (request, h) => {
                    const { chartId } = request.params;
                    const chart = await Chart.findByPk(chartId);

                    if (!chart || chart.public_version < 1) {
                        return [];
                    }

                    return get(chart.metadata, 'publish.embed-codes', []);
                }
            };
        };

        server.route(getRoute('publish-s3'));
        server.route(getRoute('publish-cloud'));
    }
};