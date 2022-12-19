import type { WorkerTypes } from '@datawrapper/backend-utils';
import type { BullmqJob } from '@datawrapper/backend-utils/dist/workerTypes';
import type { QueueEvents } from 'bullmq';
import type { JobCreationResult, JobsCreationResult } from './types';

export type BullmqQueueEventsClass = typeof QueueEvents;

type WorkerConfig = {
    queueNames: string[];
    connection: {
        host: string;
        port: number;
        password?: string;
    };
};

export type ServerConfig = {
    worker?: {
        redis?: {
            host: string;
            port: string | number;
            password?: string;
        };
        queueNames?: string[];
    };
};

/**
 * Get worker configuration from passed `config`.
 *
 * Throw an exception if the worker config is missing or invalid.
 */
function getWorkerConfig(config: ServerConfig) {
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

async function waitUntilFinished<TJob extends BullmqJob>(
    job: TJob,
    queueEvents: QueueEvents,
    maxSecondsInQueue?: number
) {
    const ttl = maxSecondsInQueue ? maxSecondsInQueue * 1000 : undefined;
    return await job.waitUntilFinished(queueEvents, ttl);
}

export class WorkerClient {
    private readonly Queue: WorkerTypes.BullmqQueueClass;
    private readonly QueueEvents: BullmqQueueEventsClass;
    private readonly workerConfig: WorkerConfig;

    constructor(
        serverConfig: ServerConfig,
        Queue: WorkerTypes.BullmqQueueClass,
        QueueEvents: BullmqQueueEventsClass
    ) {
        this.Queue = Queue;
        this.QueueEvents = QueueEvents;
        this.workerConfig = getWorkerConfig(serverConfig);
    }

    get queueNames() {
        return this.workerConfig.queueNames;
    }

    async scheduleJob<TName extends WorkerTypes.JobName>(
        queueName: string,
        jobType: TName,
        jobPayload: WorkerTypes.JobData<TName>
    ): JobCreationResult<WorkerTypes.JobResult<TName>> {
        const { queueNames, connection } = this.workerConfig;
        if (!queueNames.includes(queueName)) {
            throw new Error('unsupported queue name');
        }

        const queue = new this.Queue(queueName, { connection });
        const job = (await queue.add(jobType, jobPayload)) as BullmqJob<TName>;

        return {
            getResult: maxSecondsInQueue => {
                const queueEvents = new this.QueueEvents(queueName, { connection });
                return waitUntilFinished(job, queueEvents, maxSecondsInQueue);
            }
        };
    }

    async scheduleJobs<TName extends WorkerTypes.JobName>(
        queueName: string,
        jobType: TName,
        jobPayloads: WorkerTypes.JobData<TName>[]
    ): JobsCreationResult<WorkerTypes.JobResult<TName>> {
        const { queueNames, connection } = this.workerConfig;
        if (!queueNames.includes(queueName)) {
            throw new Error('unsupported queue name');
        }

        const queue = new this.Queue(queueName, { connection });
        const jobs = (await queue.addBulk(
            jobPayloads.map(data => ({ name: jobType, data }))
        )) as BullmqJob<TName>[];

        return {
            getResults: maxSecondsInQueue => {
                const queueEvents = new this.QueueEvents(queueName, { connection });
                return jobs.map(job => waitUntilFinished(job, queueEvents, maxSecondsInQueue));
            }
        };
    }

    async scheduleJobAndWaitForResults<TName extends WorkerTypes.JobName>(
        queueName: string,
        jobType: TName,
        jobPayload: WorkerTypes.JobData<TName>
    ): Promise<WorkerTypes.JobResult<TName>> {
        const job = await this.scheduleJob(queueName, jobType, jobPayload);
        return await job.getResult();
    }

    async getQueueHealth(queueName: string, jobsSampleSize: number) {
        const { queueNames, connection } = this.workerConfig;
        if (!queueNames.includes(queueName)) {
            throw new Error('unsupported queue name');
        }

        const report: {
            connected: boolean;
            paused?: boolean;
            numWorkers?: number;
            idle?: boolean;
            jobs?: {
                numFinished?: number;
                numCompleted?: number;
                ratioCompleted?: number;
            };
            lastJobFinishedAgoMs?: number;
        } = { connected: false };

        const queue = new this.Queue(queueName, { connection });

        // Check if the queue is paused and implicitly also if we can connect to the queue.
        try {
            report.paused = await queue.isPaused();
            report.connected = true;
        } catch (error) {
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
        report.lastJobFinishedAgoMs = new Date().getTime() - lastFinishedJob.finishedOn!;

        // Check how many of the finished jobs have completed.
        report.jobs.numCompleted = (
            await Promise.all(finishedJobs.map(job => job.isCompleted()))
        ).filter(Boolean).length;

        // Check the ratio between the finished and completed jobs.
        report.jobs.ratioCompleted = report.jobs.numFinished / report.jobs.numCompleted;

        return report;
    }
}
