const Joi = require('joi');
const { ExportJob } = require('@datawrapper/orm/db');

module.exports = {
    name: 'routes/admin/render-network',
    version: '1.0.0',
    register(server) {
        // GET /v3/admin/render-network/health
        server.route({
            method: 'GET',
            path: '/health',
            options: {
                auth: {
                    strategy: 'admin',
                    access: { scope: ['chart:read'] }
                },
                validate: {
                    query: Joi.object({
                        maxQueued: Joi.number()
                            .min(0)
                            .default(10000)
                            .description('Maximum healthy number of queued jobs')
                    })
                }
            },
            handler: getRenderNetworkHealth
        });
    }
};

async function getRenderNetworkHealth(request, h) {
    const queued = await ExportJob.count({ where: { status: 'queued' } });
    const isHealthy = queued <= request.query.maxQueued;
    return h
        .response({
            queued
        })
        .code(isHealthy ? 200 : 555);
}
