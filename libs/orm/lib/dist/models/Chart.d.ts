declare const exported: import("../utils/wrap").ExportedLite<"chart", typeof Chart>;
export default exported;
export type ChartModel = InstanceType<typeof Chart>;
export type ChartClass = typeof Chart;
import { CreationOptional, ForeignKey, HasOneGetAssociationMixin, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import type { Metadata } from '@datawrapper/shared/chartTypes';
import { type TeamModel } from './Team';
import type { UserModel } from './User';
declare const chartIdSaltSymbol: unique symbol;
declare const hashPublishingSymbol: unique symbol;
declare class Chart extends Model<InferAttributes<Chart>, InferCreationAttributes<Chart>> {
    id: string;
    type: string;
    title: string;
    theme: string;
    guest_session: string;
    last_edit_step: number;
    published_at: Date;
    public_url: string;
    public_version: number;
    deleted: boolean;
    deleted_at: Date;
    forkable: boolean;
    is_fork: boolean;
    metadata: Metadata;
    language: string;
    external_data: string;
    utf8: boolean;
    createdAt: CreationOptional<Date>;
    author_id: ForeignKey<number>;
    organization_id: ForeignKey<string>;
    getUser: HasOneGetAssociationMixin<UserModel>;
    getTeam: HasOneGetAssociationMixin<TeamModel>;
    static [chartIdSaltSymbol]: string | undefined;
    static [hashPublishingSymbol]: string | undefined;
    getPublicId(): Promise<string>;
    isEditableBy(user: UserModel, session: string): Promise<boolean | "">;
    /**
     * Checks whether or not the authenticated user may edit the data
     * of the chart
     *
     * @param {User} user - instance of the User object
     * @param {string} session - session id
     * @returns {boolean}
     */
    isDataEditableBy(user: UserModel, session: string): Promise<boolean>;
    isPublishableBy(user: UserModel): Promise<boolean>;
    getThumbnailHash(): string;
    static findAndCountAllFullText(options: Parameters<typeof Chart.findAndCountAll>[0]): Promise<{
        count: number;
        rows: Chart[];
    }>;
    static countFullText(options: Parameters<typeof Chart.count>[0]): Promise<number>;
}
