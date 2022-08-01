const Joi = require('joi');

module.exports = {
    name: 'routes/web-components',
    register: async server => {
        server.methods.registerView('web-components/Index.svelte');

        server.route({
            method: 'GET',
            path: '/',
            options: {
                auth: 'admin',
                validate: {
                    query: Joi.object({
                        charts: Joi.string().default('').allow('')
                    })
                },
                async handler(request, h) {
                    const chartIds = request.query.charts.split(',');

                    return h.view('web-components/Index.svelte', {
                        htmlClass: 'has-background-white',
                        props: {
                            chartIds
                        }
                    });
                }
            }
        });
    }
};
