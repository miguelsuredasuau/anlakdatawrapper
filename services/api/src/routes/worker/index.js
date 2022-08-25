const Joi = require('joi');
const { Queue } = require('bullmq');

module.exports = {
    name: 'routes/worker',
    version: '1.0.0',
    register: server => {
        let workerConfig;
        try {
            workerConfig = getWorkerConfig(server.methods.config());
        } catch (e) {
            server.logger.warn(
                'Missing or invalid worker config. The /v3/worker API will not be available.'
            );
            return;
        }
        const { queueNames, connection } = workerConfig;

        // POST /v3/worker/queues/{queueName}/jobs
        server.route({
            method: 'POST',
            path: '/queues/{queueName}/jobs',
            options: {
                auth: 'admin',
                description: 'Schedule a new job in `queueName`',
                validate: {
                    params: Joi.object({
                        queueName: Joi.string()
                            .required()
                            .allow(...queueNames)
                    }),
                    payload: Joi.object({
                        name: Joi.string().required().description('Job name'),
                        payload: Joi.object().description('Job payload')
                    })
                },
                handler: (request, h) => postJobs(request, h, { connection })
            }
        });

        // GET /v3/worker/health
        server.route({
            method: 'GET',
            path: '/health',
            options: {
                auth: 'admin',
                description: 'Return a health report for all queues',
                validate: {
                    query: Joi.object({
                        jobsSampleSize: Joi.number()
                            .min(0)
                            .default(100)
                            .description(
                                'We will take this number of latest jobs that finished and check ' +
                                    'how many have completed and how many have failed'
                            ),
                        minCompletedJobsRatio: Joi.number()
                            .min(0)
                            .max(1)
                            .default(1)
                            .description(
                                'Minimum healthy ratio between the number of finished jobs and ' +
                                    'number of completed jobs'
                            )
                    })
                },
                handler: (request, h) => getHealth(request, h, { connection, queueNames })
            }
        });
    }
};

async function postJobs(request, h, { connection }) {
    const { params, payload } = request;
    const { queueName } = params;
    const { name: jobName, payload: jobPayload } = payload;

    const queue = new Queue(queueName, { connection });
    await queue.add(jobName, jobPayload);

    return h.response().code(200);
}

async function getHealth(request, h, { connection, queueNames }) {
    const { query } = request;
    const { jobsSampleSize, minCompletedJobsRatio } = query;

    const report = {};
    let success = false;
    for (const queueName of queueNames) {
        const { report: queueReport, success: queueSuccess } = await getQueueHealth({
            connection,
            queueName,
            jobsSampleSize,
            minCompletedJobsRatio
        });
        success &= queueSuccess;
        report[queueName] = queueReport;
    }

    return h.response(report).code(success ? 200 : 555);
}

async function getQueueHealth({ connection, queueName, jobsSampleSize, minCompletedJobsRatio }) {
    const report = {};

    const queue = new Queue(queueName, { connection });

    // Check if the queue is paused and implicitly also if we can connect to the queue.
    try {
        report.paused = await queue.isPaused();
        report.connected = true;
    } catch (error) {
        report.connected = false;
        return { report, success: false };
    }

    // Check the number of workers connected to the queue.
    const workers = await queue.getWorkers();
    report.numWorkers = workers.length;
    if (!report.numWorkers) {
        return { report, success: false };
    }

    // Check if the queue is idle, i.e. if there are no jobs waiting to be processed.
    report.idle = (await queue.getJobCountByTypes('active', 'waiting')) === 0;

    // Check the number of finished jobs in the queue.
    const finishedJobs = await queue.getJobs(['completed', 'failed'], 0, jobsSampleSize);
    report.jobs = report.jobs || {};
    report.jobs.numFinished = finishedJobs.length;
    if (!report.jobs.numFinished) {
        return { report, success: false };
    }

    // Check when was the last time a job finished.
    report.lastJobFinishedAgoMs = new Date().getTime() - finishedJobs[0].finishedOn;

    // Check how many of the finished jobs have completed.
    report.jobs.numCompleted = (
        await Promise.all(finishedJobs.map(job => job.isCompleted()))
    ).filter(Boolean).length;

    // Check the ratio between the finished and completed jobs.
    report.jobs.ratioCompleted = report.jobs.numFinished / report.jobs.numCompleted;
    if (report.jobs.ratioCompleted < minCompletedJobsRatio) {
        return { report, success: false };
    }

    return { report, success: true };
}

/**
 * Get worker configuration from passed `config`.
 *
 * Throw an exception if the worker config is missing or invalid.
 */
function getWorkerConfig(config) {
    if (
        !config.worker?.redis?.host ||
        !config.worker?.redis?.port ||
        !Array.isArray(config.worker?.queueNames)
    ) {
        throw new Error('Missing or invalid worker config');
    }
    return {
        queueNames: config.worker.queueNames.map(String),
        connection: {
            host: config.worker.redis.host,
            port: +config.worker.redis.port,
            ...(config.worker.redis.password && { password: config.worker.redis.password })
        }
    };
}
