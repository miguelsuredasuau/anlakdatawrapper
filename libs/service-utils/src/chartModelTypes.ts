import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { Metadata } from '@datawrapper/shared/chartTypes';
import type { Team } from './teamModelTypes';
import type { User } from './userModelTypes';

/**
 * @see @datawrapper/orm/models/Chart.js
 * @see @datawrapper/orm/models/chartAttributes.js
 */
export class Chart extends Model<InferAttributes<Chart>, InferCreationAttributes<Chart>> {
    declare id: CreationOptional<string>;
    declare type: string;
    declare title: string;
    declare theme: string;

    declare guest_session: CreationOptional<string>;

    declare last_edit_step: CreationOptional<number>;

    declare published_at: CreationOptional<Date>;
    declare public_url: CreationOptional<string>;
    declare public_version: CreationOptional<number>;

    declare deleted: CreationOptional<boolean>;
    declare deleted_at: CreationOptional<Date>;

    declare forkable: CreationOptional<boolean>;
    declare is_fork: CreationOptional<boolean>;

    declare metadata: Metadata;
    declare language: string;
    declare external_data: CreationOptional<string>;

    declare utf8: CreationOptional<boolean>;

    declare organization_id?: CreationOptional<string>;
    declare team: CreationOptional<Team | null>;

    declare author_id?: number;
    declare user: CreationOptional<User | null>;

    declare in_folder: CreationOptional<string | null>;

    declare getPublicId: () => Promise<string>;
}

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

    in_folder?: string | null;
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
    folderId?: string | null;
    author?:
        | {
              name?: string;
              email?: string;
          }
        | undefined;
};
