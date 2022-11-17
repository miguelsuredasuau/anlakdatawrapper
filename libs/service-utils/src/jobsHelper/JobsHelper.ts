import type { WorkerTypes } from '@datawrapper/backend-utils';
import { WorkerClient, BullmqQueueEventsClass, ServerConfig } from './WorkerClient';
import { ExportJob, ExportJobOptions, RenderNetworkClient } from './RenderNetworkClient';
import type { InvalidateCloudflareJobData } from './types';

export class JobsHelper {
    public readonly workerClient?: WorkerClient;
    private readonly renderNetworkClient: RenderNetworkClient;

    constructor(
        config: ServerConfig,
        Queue: WorkerTypes.BullmqQueueClass,
        QueueEvents: BullmqQueueEventsClass,
        ExportJob: ExportJob,
        onError: (e: unknown) => void
    ) {
        this.renderNetworkClient = new RenderNetworkClient(ExportJob);
        try {
            this.workerClient = new WorkerClient(config, Queue, QueueEvents);
        } catch (e) {
            onError(e);
        }
    }

    async scheduleInvalidateCloudflareJobs(
        bulkJobData: InvalidateCloudflareJobData[],
        renderNetworkParams: ExportJobOptions
    ) {
        const queueName = 'compute';
        if (this.workerClient && this.workerClient.queueNames.includes(queueName)) {
            return await this.workerClient.scheduleJobs(
                queueName,
                'invalidateCloudflareCache',
                bulkJobData
            );
        }

        return await this.renderNetworkClient.scheduleInvalidateCloudflareJobs(
            bulkJobData,
            renderNetworkParams
        );
    }

    async scheduleInvalidateCloudflareJob(
        jobData: InvalidateCloudflareJobData,
        renderNetworkParams: ExportJobOptions
    ) {
        return await this.scheduleInvalidateCloudflareJobs([jobData], renderNetworkParams);
    }
}
