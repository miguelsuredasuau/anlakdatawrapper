import type { WorkerTypes } from '@datawrapper/backend-utils';
import { WorkerClient, BullmqQueueEventsClass, ServerConfig } from './WorkerClient';
import { ExportJob, ExportJobOptions } from './RenderNetworkClient';
import type { InvalidateCloudflareJobData } from './types';
export declare class JobsHelper {
    readonly workerClient?: WorkerClient;
    private readonly renderNetworkClient;
    constructor(config: ServerConfig, Queue: WorkerTypes.BullmqQueueClass, QueueEvents: BullmqQueueEventsClass, ExportJob: ExportJob, onError: (e: unknown) => void);
    scheduleInvalidateCloudflareJobs(bulkJobData: InvalidateCloudflareJobData[], renderNetworkParams: ExportJobOptions): Promise<void | import("bullmq").Job<{
        name: string;
    } | {
        urls: string[];
    }, void | string[], keyof {
        hello: {
            data: {
                name: string;
            };
            result: string[];
        };
        invalidateCloudflareCache: {
            data: {
                urls: string[];
            };
            result: void;
        };
    }>[]>;
    scheduleInvalidateCloudflareJob(jobData: InvalidateCloudflareJobData, renderNetworkParams: ExportJobOptions): Promise<void | import("bullmq").Job<{
        name: string;
    } | {
        urls: string[];
    }, void | string[], keyof {
        hello: {
            data: {
                name: string;
            };
            result: string[];
        };
        invalidateCloudflareCache: {
            data: {
                urls: string[];
            };
            result: void;
        };
    }>[]>;
}
