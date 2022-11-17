import type { InvalidateCloudflareJobData } from './types';

export type ExportJobOptions = {
    key: string;
    priority: number;
};

type ExportJobData = {
    key: string;
    priority: number;
    chart_id?: string | undefined;
    user_id?: string | undefined;
    tasks: {
        action: string;
        params: Record<string, unknown>;
    }[];
};

export type ExportJob = {
    bulkCreate(data: ExportJobData[]): Promise<void>;
};

export class RenderNetworkClient {
    private readonly ExportJob: ExportJob;

    constructor(ExportJob: ExportJob) {
        this.ExportJob = ExportJob;
    }

    async scheduleInvalidateCloudflareJobs(
        bulkJobData: InvalidateCloudflareJobData[],
        { key, priority }: ExportJobOptions
    ) {
        return await this.ExportJob.bulkCreate(
            bulkJobData.map(({ chartId, userId, urls }) => ({
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
            }))
        );
    }
}
