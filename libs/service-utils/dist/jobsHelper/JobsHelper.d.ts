import type { WorkerTypes } from '@datawrapper/backend-utils';
import type { ExportJob } from '@datawrapper/orm/db';
import { ExportJobOptions } from './RenderNetworkClient';
import type { ExportChartJobData, InvalidateCloudflareJobData } from './types';
import { WorkerClient, BullmqQueueEventsClass, ServerConfig } from './WorkerClient';
declare type ExportJobType = typeof ExportJob;
export declare class JobsHelper {
    readonly workerClient?: WorkerClient;
    private readonly renderNetworkClient;
    constructor(config: ServerConfig, Queue: WorkerTypes.BullmqQueueClass, QueueEvents: BullmqQueueEventsClass, ExportJob: ExportJobType, onError: (e: unknown) => void);
    scheduleInvalidateCloudflareJobs(bulkJobData: InvalidateCloudflareJobData[], renderNetworkParams: ExportJobOptions): Promise<{
        getResults(maxSecondsInQueue?: number | undefined): Promise<void>[];
    }>;
    scheduleInvalidateCloudflareJob(jobData: InvalidateCloudflareJobData, renderNetworkParams: ExportJobOptions): Promise<{
        getResult(maxSecondsInQueue?: number | undefined): Promise<void>;
    }>;
    scheduleChartExport(jobData: ExportChartJobData, renderNetworkParams: ExportJobOptions): Promise<{
        getResult(maxSecondsInQueue?: number | undefined): Promise<void>;
    }>;
}
export {};
