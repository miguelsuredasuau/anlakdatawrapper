const Joi = require('joi');

module.exports = {
    name: 'routes/team/:id"',
    version: '1.0.0',
    register: async server => {
        server.route({
            method: 'GET',
            path: '/',
            options: {
                validate: {
                    params: Joi.object({
                        teamId: Joi.string().required()
                    })
                },
                async handler(request, h) {
                    return h.redirect(`/archive/team/${request.params.teamId}`);
                }
            }
        });

        await server.register(require('./settings.js'));
        await server.register(require('./invite/{token}/accept.js'));
        await server.register(require('./invite/{token}/reject.js'));
    }
};
