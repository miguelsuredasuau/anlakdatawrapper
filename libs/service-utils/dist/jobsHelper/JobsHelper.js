"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsHelper = void 0;
const WorkerClient_1 = require("./WorkerClient");
const RenderNetworkClient_1 = require("./RenderNetworkClient");
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
        return await this.scheduleInvalidateCloudflareJobs([jobData], renderNetworkParams);
    }
}
exports.JobsHelper = JobsHelper;
