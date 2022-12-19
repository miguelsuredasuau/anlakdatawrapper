import type { WorkerTypes } from '@datawrapper/backend-utils';
import type { ExportJob } from '@datawrapper/orm/db';
import { ExportJobOptions, RenderNetworkClient } from './RenderNetworkClient';
import type { ExportChartJobData, InvalidateCloudflareJobData } from './types';
import { WorkerClient, BullmqQueueEventsClass, ServerConfig } from './WorkerClient';

type ExportJobType = typeof ExportJob;

export class JobsHelper {
    public readonly workerClient?: WorkerClient;
    private readonly renderNetworkClient: RenderNetworkClient;

    constructor(
        config: ServerConfig,
        Queue: WorkerTypes.BullmqQueueClass,
        QueueEvents: BullmqQueueEventsClass,
        ExportJob: ExportJobType,
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
        const queueName = 'compute';
        if (this.workerClient && this.workerClient.queueNames.includes(queueName)) {
            return await this.workerClient.scheduleJob(
                queueName,
                'invalidateCloudflareCache',
                jobData
            );
        }

        return await this.renderNetworkClient.scheduleInvalidateCloudflareJob(
            jobData,
            renderNetworkParams
        );
    }

    async scheduleChartExport(jobData: ExportChartJobData, renderNetworkParams: ExportJobOptions) {
        return await this.renderNetworkClient.scheduleChartExport(jobData, renderNetworkParams);
    }
}
