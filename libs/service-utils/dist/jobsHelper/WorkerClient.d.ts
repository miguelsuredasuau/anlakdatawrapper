import type { WorkerTypes } from '@datawrapper/backend-utils';
import type { QueueEvents } from 'bullmq';
import type { JobCreationResult, JobsCreationResult } from './types';
export declare type BullmqQueueEventsClass = typeof QueueEvents;
export declare type ServerConfig = {
    worker?: {
        redis?: {
            host: string;
            port: string | number;
            password?: string;
        };
        queueNames?: string[];
    };
};
export declare class WorkerClient {
    private readonly Queue;
    private readonly QueueEvents;
    private readonly workerConfig;
    constructor(serverConfig: ServerConfig, Queue: WorkerTypes.BullmqQueueClass, QueueEvents: BullmqQueueEventsClass);
    get queueNames(): string[];
    scheduleJob<TName extends WorkerTypes.JobName>(queueName: string, jobType: TName, jobPayload: WorkerTypes.JobData<TName>): JobCreationResult<WorkerTypes.JobResult<TName>>;
    scheduleJobs<TName extends WorkerTypes.JobName>(queueName: string, jobType: TName, jobPayloads: WorkerTypes.JobData<TName>[]): JobsCreationResult<WorkerTypes.JobResult<TName>>;
    scheduleJobAndWaitForResults<TName extends WorkerTypes.JobName>(queueName: string, jobType: TName, jobPayload: WorkerTypes.JobData<TName>): Promise<WorkerTypes.JobResult<TName>>;
    getQueueHealth(queueName: string, jobsSampleSize: number): Promise<{
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
    }>;
}
