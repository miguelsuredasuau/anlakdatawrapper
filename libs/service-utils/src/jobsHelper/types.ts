import type { ExportPrint } from '@datawrapper/shared/exportPrintTypes';

export type InvalidateCloudflareJobData = {
    chartId: string | null;
    userId: number | null;
    urls: string[];
};

export enum ExportFormat {
    PDF = 'pdf',
    PNG = 'png',
    SVG = 'svg'
}

type PdfJobData = {
    format: ExportFormat.PDF;
    options: Pick<
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
        | 'colorMode'
        | 'fullVector'
        | 'ligatures'
        | 'dark'
    > &
        Partial<Pick<Parameters<ExportPrint['pdf']>[0], 'delay'>>;
};

type SvgJobData = {
    format: ExportFormat.SVG;
    options: Pick<
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
};

type PngJobData = {
    format: ExportFormat.PNG;
    options: {
        width: number;
        height: number | 'auto';
        zoom: number;
        plain: boolean;
        transparent: boolean;
        published?: boolean;
        logo: string | undefined;
        logoId: string | undefined;
        dark: boolean;
    };
    border?:
        | {
              padding: number;
              color: string;
          }
        | undefined;
    exif: {
        tags: Record<string, string>;
    };
};

export type ExportChartJobData = {
    chartId: string;
    userId: number;
    export: PdfJobData | SvgJobData | PngJobData;
    publish?: {
        teamId: string | null;
        outFile: string;
    };
    save?: {
        s3?: {
            bucket: string;
            path: string;
            acl: 'private' | 'public-read';
        };
        file?: {
            out: string;
        };
    };
};

type JobCompletionErrorCode = 'failed' | 'timeout';

export class JobCompletionError extends Error {
    constructor(public readonly code: JobCompletionErrorCode) {
        super();
    }
}

export type JobCreationResult<TReturn> = Promise<{
    getResult(maxSecondsInQueue?: number): Promise<TReturn>;
}>;

export type JobsCreationResult<TReturn> = Promise<{
    getResults(maxSecondsInQueue?: number): Promise<TReturn>[];
}>;
