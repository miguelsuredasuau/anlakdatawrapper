"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerClient = void 0;
/**
 * Get worker configuration from passed `config`.
 *
 * Throw an exception if the worker config is missing or invalid.
 */
function getWorkerConfig(config) {
    if (!config.worker?.redis?.host ||
        !config.worker?.redis?.port ||
        !Array.isArray(config.worker?.queueNames)) {
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
async function waitUntilFinished(job, queueEvents, maxSecondsInQueue) {
    const ttl = maxSecondsInQueue ? maxSecondsInQueue * 1000 : undefined;
    return await job.waitUntilFinished(queueEvents, ttl);
}
class WorkerClient {
    Queue;
    QueueEvents;
    workerConfig;
    constructor(serverConfig, Queue, QueueEvents) {
        this.Queue = Queue;
        this.QueueEvents = QueueEvents;
        this.workerConfig = getWorkerConfig(serverConfig);
    }
    get queueNames() {
        return this.workerConfig.queueNames;
    }
    async scheduleJob(queueName, jobType, jobPayload) {
        const { queueNames, connection } = this.workerConfig;
        if (!queueNames.includes(queueName)) {
            throw new Error('unsupported queue name');
        }
        const queue = new this.Queue(queueName, { connection });
        const job = (await queue.add(jobType, jobPayload));
        return {
            getResult: maxSecondsInQueue => {
                const queueEvents = new this.QueueEvents(queueName, { connection });
                return waitUntilFinished(job, queueEvents, maxSecondsInQueue);
            }
        };
    }
    async scheduleJobs(queueName, jobType, jobPayloads) {
        const { queueNames, connection } = this.workerConfig;
        if (!queueNames.includes(queueName)) {
            throw new Error('unsupported queue name');
        }
        const queue = new this.Queue(queueName, { connection });
        const jobs = (await queue.addBulk(jobPayloads.map(data => ({ name: jobType, data }))));
        return {
            getResults: maxSecondsInQueue => {
                const queueEvents = new this.QueueEvents(queueName, { connection });
                return jobs.map(job => waitUntilFinished(job, queueEvents, maxSecondsInQueue));
            }
        };
    }
    async scheduleJobAndWaitForResults(queueName, jobType, jobPayload) {
        const job = await this.scheduleJob(queueName, jobType, jobPayload);
        return await job.getResult();
    }
    async getQueueHealth(queueName, jobsSampleSize) {
        const { queueNames, connection } = this.workerConfig;
        if (!queueNames.includes(queueName)) {
            throw new Error('unsupported queue name');
        }
        const report = { connected: false };
        const queue = new this.Queue(queueName, { connection });
        // Check if the queue is paused and implicitly also if we can connect to the queue.
        try {
            report.paused = await queue.isPaused();
            report.connected = true;
        }
        catch (error) {
            return report;
        }
        // Check the number of workers connected to the queue.
        const workers = await queue.getWorkers();
        report.numWorkers = workers.length;
        if (!report.numWorkers) {
            return report;
        }
        // Check if the queue is idle, i.e. if there are no jobs waiting to be processed.
        report.idle = (await queue.getJobCountByTypes('active', 'waiting')) === 0;
        // Check the number of finished jobs in the queue.
        const finishedJobs = await queue.getJobs(['completed', 'failed'], 0, jobsSampleSize);
        report.jobs = report.jobs || {};
        report.jobs.numFinished = finishedJobs.length;
        const lastFinishedJob = finishedJobs[0];
        if (!lastFinishedJob) {
            return report;
        }
        // Check when was the last time a job finished.
        report.lastJobFinishedAgoMs = new Date().getTime() - lastFinishedJob.finishedOn;
        // Check how many of the finished jobs have completed.
        report.jobs.numCompleted = (await Promise.all(finishedJobs.map(job => job.isCompleted()))).filter(Boolean).length;
        // Check the ratio between the finished and completed jobs.
        report.jobs.ratioCompleted = report.jobs.numFinished / report.jobs.numCompleted;
        return report;
    }
}
exports.WorkerClient = WorkerClient;
