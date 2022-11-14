import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { Metadata } from '@datawrapper/shared/chartTypes';
import type { Team } from './teamModelTypes';
import type { User } from './userModelTypes';
/**
 * @see @datawrapper/orm/models/Chart.js
 * @see @datawrapper/orm/models/chartAttributes.js
 */
export declare class Chart extends Model<InferAttributes<Chart>, InferCreationAttributes<Chart>> {
    id: CreationOptional<string>;
    type: string;
    title: string;
    theme: string;
    guest_session: CreationOptional<string>;
    last_edit_step: CreationOptional<number>;
    published_at: CreationOptional<Date>;
    public_url: CreationOptional<string>;
    public_version: CreationOptional<number>;
    deleted: CreationOptional<boolean>;
    deleted_at: CreationOptional<Date>;
    forkable: CreationOptional<boolean>;
    is_fork: CreationOptional<boolean>;
    metadata: Metadata;
    language: string;
    external_data: CreationOptional<string>;
    utf8: CreationOptional<boolean>;
    organization_id?: CreationOptional<string>;
    team: CreationOptional<Team | null>;
    author_id?: number;
    user: CreationOptional<User | null>;
    in_folder: CreationOptional<string | null>;
    getPublicId: () => Promise<string>;
}
export declare type ChartDataValues = {
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
export declare type PreparedChart = {
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
    author?: {
        name?: string;
        email?: string;
    } | undefined;
};
