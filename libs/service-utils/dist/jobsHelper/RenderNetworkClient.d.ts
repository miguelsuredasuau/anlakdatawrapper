import type { ExportJob } from '@datawrapper/orm/db';
import { ExportChartJobData, InvalidateCloudflareJobData } from './types';
declare type ExportJobType = typeof ExportJob;
export declare type ExportJobOptions = {
    key: string;
    priority: number;
};
export declare class RenderNetworkClient {
    private readonly ExportJob;
    constructor(ExportJob: ExportJobType);
    private bulkCreate;
    private create;
    scheduleInvalidateCloudflareJobs<TOptions extends ExportJobOptions>(bulkJobData: InvalidateCloudflareJobData[], options: TOptions): Promise<{
        getResults(maxSecondsInQueue?: number | undefined): Promise<void>[];
    }>;
    scheduleInvalidateCloudflareJob<TOptions extends ExportJobOptions>({ chartId, userId, urls }: InvalidateCloudflareJobData, options: TOptions): Promise<{
        getResult(maxSecondsInQueue?: number | undefined): Promise<void>;
    }>;
    scheduleChartExport<TOptions extends ExportJobOptions>(jobData: ExportChartJobData, options: TOptions): Promise<{
        getResult(maxSecondsInQueue?: number | undefined): Promise<void>;
    }>;
}
export {};
