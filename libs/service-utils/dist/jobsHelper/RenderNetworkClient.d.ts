import type { InvalidateCloudflareJobData } from './types';
export declare type ExportJobOptions = {
    key: string;
    priority: number;
};
declare type ExportJobData = {
    key: string;
    priority: number;
    chart_id?: string | undefined;
    user_id?: string | undefined;
    tasks: {
        action: string;
        params: Record<string, unknown>;
    }[];
};
export declare type ExportJob = {
    bulkCreate(data: ExportJobData[]): Promise<void>;
};
export declare class RenderNetworkClient {
    private readonly ExportJob;
    constructor(ExportJob: ExportJob);
    scheduleInvalidateCloudflareJobs(bulkJobData: InvalidateCloudflareJobData[], { key, priority }: ExportJobOptions): Promise<void>;
}
export {};
