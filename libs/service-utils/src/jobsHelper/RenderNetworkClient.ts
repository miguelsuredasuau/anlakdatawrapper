import type { ExportJobModel } from '@datawrapper/orm';
import type { ExportJob } from '@datawrapper/orm/db';
import type { ExportPrint } from '@datawrapper/shared/exportPrintTypes';
import {
    ExportChartJobData,
    ExportFormat,
    InvalidateCloudflareJobData,
    JobCompletionError,
    JobCreationResult,
    JobsCreationResult
} from './types';

type ExportJobType = typeof ExportJob;

type Filename = `export.${ExportFormat}`;

type ChartPdfExportTaskOptions = {
    out: Filename;
    mode: Parameters<ExportPrint['pdf']>[0]['colorMode'];
} & Pick<
    Parameters<ExportPrint['pdf']>[0],
    | 'width'
    | 'height'
    | 'plain'
    | 'logo'
    | 'logoId'
    | 'unit'
    | 'scale'
    | 'border'
    | 'transparent'
    | 'fullVector'
    | 'ligatures'
    | 'dark'
> &
    Partial<Pick<Parameters<ExportPrint['pdf']>[0], 'delay'>>;

type ChartSvgExportTaskOptions = {
    out: Filename;
} & Pick<
    Parameters<ExportPrint['svg']>[0],
    | 'width'
    | 'height'
    | 'plain'
    | 'logo'
    | 'logoId'
    | 'fullVector'
    | 'delay'
    | 'dark'
    | 'transparent'
>;

type ChartPngExportTaskOptions = {
    sizes: {
        width: number;
        height: number | 'auto';
        out: Filename;
        zoom: number;
        plain: boolean;
        transparent: boolean;
        published?: boolean;
        logo: string | undefined;
        logoId: string | undefined;
        dark: boolean;
    }[];
};

type GenericTask<TAction extends string, TParams> = {
    action: TAction;
    params: TParams;
};

type Task =
    | GenericTask<'cloudflare', { urls: string[] }>
    | GenericTask<'pdf', ChartPdfExportTaskOptions>
    | GenericTask<'png', ChartPngExportTaskOptions>
    | GenericTask<'svg', ChartSvgExportTaskOptions>
    | GenericTask<'border', { image: Filename; out: Filename; padding: number; color: string }>
    | GenericTask<'exif', { image: Filename; tags: Record<string, string> }>
    | GenericTask<'file', { file: Filename; out: string }>
    | GenericTask<'publish', { file: Filename; teamId: string | null; outFile: string }>
    | GenericTask<
          's3',
          { file: Filename; bucket: string; path: string; acl: 'private' | 'public-read' }
      >;

export type ExportJobOptions = {
    key: string;
    priority: number;
};

type JobData = {
    chartId: string | null;
    userId: number | null;
    tasks: Task[];
};

const waitForJobCompletion = (job: ExportJobModel, maxSecondsInQueue: number | undefined) => {
    // todo keep request open until result
    const deadline = Date.now() + (maxSecondsInQueue ?? 0) * 1000;

    return new Promise<void>((resolve, reject) => {
        (function checkResult() {
            job.reload().then(job => {
                if (job.status === 'done') {
                    return resolve();
                }

                if (job.status === 'failed') {
                    return reject(new JobCompletionError('failed'));
                }

                if (job.status === 'queued' && maxSecondsInQueue && Date.now() > deadline) {
                    job.status = 'done';
                    job.done_at = new Date();
                    job.save();

                    return reject(new JobCompletionError('timeout'));
                }

                if (job.status === 'in_progress' && maxSecondsInQueue && job.priority >= 0) {
                    // Negative priority will prevent this job from being ever scheduled again.
                    // Limit on the time spent in queue implies that we don't want to retry the job,
                    // because jobs are only retried after spending too much time in execution.
                    job.priority = -1;
                    job.save();
                }

                setTimeout(checkResult, 1000);
            });
        })();
    });
};

export class RenderNetworkClient {
    private readonly ExportJob: ExportJobType;

    constructor(ExportJob: ExportJobType) {
        this.ExportJob = ExportJob;
    }

    private async bulkCreate<TOptions extends ExportJobOptions>(
        bulkJobData: JobData[],
        options: TOptions
    ): JobsCreationResult<void> {
        const jobs = await this.ExportJob.bulkCreate(
            bulkJobData.map(({ chartId, userId, tasks }) => ({
                key: options.key,
                priority: options.priority,
                chart_id: chartId,
                user_id: userId,
                tasks
            }))
        );

        return {
            getResults: maxSecondsInQueue =>
                jobs.map(job => waitForJobCompletion(job, maxSecondsInQueue))
        };
    }

    private async create<TOptions extends ExportJobOptions>(
        { chartId, userId, tasks }: JobData,
        options: TOptions
    ): JobCreationResult<void> {
        const job = await this.ExportJob.create({
            key: options.key,
            priority: options.priority,
            chart_id: chartId,
            user_id: userId,
            tasks: tasks
        });

        return {
            getResult: maxSecondsInQueue => waitForJobCompletion(job, maxSecondsInQueue)
        };
    }

    async scheduleInvalidateCloudflareJobs<TOptions extends ExportJobOptions>(
        bulkJobData: InvalidateCloudflareJobData[],
        options: TOptions
    ) {
        return await this.bulkCreate(
            bulkJobData.map(({ chartId, userId, urls }) => ({
                chartId,
                userId,
                tasks: [
                    {
                        action: 'cloudflare',
                        params: {
                            urls
                        }
                    }
                ]
            })),
            options
        );
    }

    async scheduleInvalidateCloudflareJob<TOptions extends ExportJobOptions>(
        { chartId, userId, urls }: InvalidateCloudflareJobData,
        options: TOptions
    ) {
        return await this.create(
            {
                chartId,
                userId,
                tasks: [
                    {
                        action: 'cloudflare',
                        params: {
                            urls
                        }
                    }
                ]
            },
            options
        );
    }

    async scheduleChartExport<TOptions extends ExportJobOptions>(
        jobData: ExportChartJobData,
        options: TOptions
    ) {
        const tasks: Task[] = [];
        const filename = `export.${jobData.export.format}` as const;

        switch (jobData.export.format) {
            case ExportFormat.PDF:
                tasks.push({
                    action: jobData.export.format,
                    params: {
                        ...jobData.export.options,
                        mode: jobData.export.options.colorMode,
                        out: filename
                    }
                });
                break;
            case ExportFormat.SVG:
                tasks.push({
                    action: jobData.export.format,
                    params: {
                        ...jobData.export.options,
                        out: filename
                    }
                });
                break;
            case ExportFormat.PNG:
                tasks.push({
                    action: jobData.export.format,
                    params: {
                        sizes: [
                            {
                                ...jobData.export.options,
                                out: filename
                            }
                        ]
                    }
                });
                if (jobData.export.border) {
                    tasks.push({
                        action: 'border',
                        params: {
                            ...jobData.export.border,
                            image: filename,
                            out: filename
                        }
                    });
                }
                if (jobData.export.exif) {
                    tasks.push({
                        action: 'exif',
                        params: {
                            ...jobData.export.exif,
                            image: filename
                        }
                    });
                }
                break;
            default:
                throw new Error('Unsupported format');
        }

        if (jobData.publish) {
            tasks.push({
                action: 'publish',
                params: {
                    ...jobData.publish,
                    file: filename
                }
            });
        }

        if (jobData.save?.file) {
            tasks.push({
                action: 'file',
                params: {
                    ...jobData.save.file,
                    file: filename
                }
            });
        }

        if (jobData.save?.s3) {
            tasks.push({
                action: 's3',
                params: {
                    ...jobData.save.s3,
                    file: filename
                }
            });
        }

        return await this.create(
            {
                chartId: jobData.chartId,
                userId: jobData.userId,
                tasks
            },
            options
        );
    }
}
