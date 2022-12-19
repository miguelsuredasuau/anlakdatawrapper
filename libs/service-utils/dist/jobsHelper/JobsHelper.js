"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsHelper = void 0;
const RenderNetworkClient_1 = require("./RenderNetworkClient");
const WorkerClient_1 = require("./WorkerClient");
class JobsHelper {
    workerClient;
    renderNetworkClient;
    constructor(config, Queue, QueueEvents, ExportJob, onError) {
        this.renderNetworkClient = new RenderNetworkClient_1.RenderNetworkClient(ExportJob);
        try {
            this.workerClient = new WorkerClient_1.WorkerClient(config, Queue, QueueEvents);
        }
        catch (e) {
            onError(e);
        }
    }
    async scheduleInvalidateCloudflareJobs(bulkJobData, renderNetworkParams) {
        const queueName = 'compute';
        if (this.workerClient && this.workerClient.queueNames.includes(queueName)) {
            return await this.workerClient.scheduleJobs(queueName, 'invalidateCloudflareCache', bulkJobData);
        }
        return await this.renderNetworkClient.scheduleInvalidateCloudflareJobs(bulkJobData, renderNetworkParams);
    }
    async scheduleInvalidateCloudflareJob(jobData, renderNetworkParams) {
        const queueName = 'compute';
        if (this.workerClient && this.workerClient.queueNames.includes(queueName)) {
            return await this.workerClient.scheduleJob(queueName, 'invalidateCloudflareCache', jobData);
        }
        return await this.renderNetworkClient.scheduleInvalidateCloudflareJob(jobData, renderNetworkParams);
    }
    async scheduleChartExport(jobData, renderNetworkParams) {
        return await this.renderNetworkClient.scheduleChartExport(jobData, renderNetworkParams);
    }
}
exports.JobsHelper = JobsHelper;
