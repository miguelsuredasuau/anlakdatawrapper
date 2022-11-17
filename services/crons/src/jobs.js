const { JobsHelper } = require('@datawrapper/service-utils');
const { Queue, QueueEvents } = require('bullmq');
const config = require('./config');
const logger = require('./logger');

exports.createJobsHelper = () =>
    new JobsHelper(config, Queue, QueueEvents, require('@datawrapper/orm/models').ExportJob, e =>
        logger.warn(`An error occured while trying to set up bullmq: ${e}`)
    );
