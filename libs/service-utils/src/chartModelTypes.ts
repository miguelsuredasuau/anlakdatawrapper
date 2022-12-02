import type { Metadata } from '@datawrapper/shared/chartTypes';

export type ChartDataValues = {
    id: string;
    type: string;
    title: string;
    theme: string;

    guest_session?: string;

    last_edit_step?: number;

    published_at?: Date;
    public_url?: string;
    public_version?: number;

    deleted?: boolean;
    deleted_at?: Date;

    forkable?: boolean;
    forked_from?: string;
    is_fork?: boolean;

    metadata?: Metadata;
    language?: string;
    external_data?: string;

    utf8?: boolean;

    in_folder?: number | null;
    organization_id?: string;
};

export type PreparedChart = {
    id?: string;
    type?: string;
    title?: string;
    theme?: string;

    guestSession?: undefined;

    lastEditStep?: number;

    publishedAt?: Date;
    publicUrl?: string;
    publicVersion?: number;

    deleted?: boolean;
    deletedAt?: Date;

    forkable?: boolean;
    isFork?: boolean;

    metadata?: Metadata;
    language?: string;
    externalData?: string;

    publicId?: string | undefined;
    folderId?: number | null;
    author?:
        | {
              name?: string | null;
              email?: string | null;
          }
        | undefined;
};
