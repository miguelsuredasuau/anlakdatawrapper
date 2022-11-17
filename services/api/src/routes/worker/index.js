const Joi = require('joi');

module.exports = {
    name: 'routes/worker',
    version: '1.0.0',
    register: server => {
        const jobsHelper = server.methods.getJobsHelper();
        const workerClient = jobsHelper.workerClient;
        if (!workerClient) {
            server.logger.warn(
                'Missing or invalid worker config. The /v3/worker API will not be available.'
            );
            return;
        }

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
                            .allow(...workerClient.queueNames)
                    }),
                    payload: Joi.object({
                        name: Joi.string().required().description('Job name'),
                        payload: Joi.object().description('Job payload'),
                        waitForResults: Joi.boolean()
                            .optional()
                            .description(
                                'Whether server should wait for results and return them along with the job'
                            )
                    })
                },
                handler: (request, h) => postJobs(request, h, { workerClient })
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
                handler: (request, h) => getHealth(request, h, { workerClient })
            }
        });
    }
};

async function postJobs(request, h, { workerClient }) {
    const { params, payload } = request;
    const { queueName } = params;
    const { name: jobName, payload: jobPayload, waitForResults } = payload;

    if (!waitForResults) {
        return await workerClient.scheduleJob(queueName, jobName, jobPayload);
    }

    return await workerClient.scheduleJobAndWaitForResults(queueName, jobName, jobPayload);
}

async function getHealth(request, h, { workerClient }) {
    const { query } = request;
    const { jobsSampleSize, minCompletedJobsRatio } = query;
    const queueNames = workerClient.queueNames;

    const report = {};
    let success = true;
    for (const queueName of queueNames) {
        const { report: queueReport, success: queueSuccess } = await getQueueHealth({
            workerClient,
            queueName,
            jobsSampleSize,
            minCompletedJobsRatio
        });
        success &= queueSuccess;
        report[queueName] = queueReport;
    }

    return h.response(report).code(success ? 200 : 555);
}

async function getQueueHealth({ workerClient, queueName, jobsSampleSize, minCompletedJobsRatio }) {
    const report = await workerClient.getQueueHealth(queueName, jobsSampleSize);

    return {
        report,
        success:
            report.connected &&
            !!report.numWorkers &&
            !!report.jobs.numFinished &&
            report.jobs.ratioCompleted >= minCompletedJobsRatio
    };
}
