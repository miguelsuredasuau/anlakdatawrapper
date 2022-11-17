"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderNetworkClient = void 0;
class RenderNetworkClient {
    ExportJob;
    constructor(ExportJob) {
        this.ExportJob = ExportJob;
    }
    async scheduleInvalidateCloudflareJobs(bulkJobData, { key, priority }) {
        return await this.ExportJob.bulkCreate(bulkJobData.map(({ chartId, userId, urls }) => ({
            key,
            priority,
            chart_id: chartId,
            user_id: userId,
            tasks: [
                {
                    action: 'cloudflare',
                    params: {
                        urls
                    }
                }
            ]
        })));
    }
}
exports.RenderNetworkClient = RenderNetworkClient;
