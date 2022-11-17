const { JobsHelper } = require('@datawrapper/service-utils');
const { Queue, QueueEvents } = require('bullmq');

module.exports = {
    name: 'utils/jobs',
    version: '1.0.0',
    register: async server => {
        const helper = new JobsHelper(
            server.methods.config(),
            Queue,
            QueueEvents,
            require('@datawrapper/orm/models').ExportJob,
            e => server.logger.warn(`An error occured while trying to set up bullmq: ${e}`)
        );
        server.method('getJobsHelper', () => helper);
    }
};
