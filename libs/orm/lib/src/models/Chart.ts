import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('chart')<typeof Chart>();
export default exported;
export type ChartModel = InstanceType<typeof Chart>;
export type ChartClass = typeof Chart;

import crypto from 'crypto';
import get from 'lodash/get';
import {
    CreationOptional,
    ForeignKey,
    HasOneGetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import type { Metadata } from '@datawrapper/shared/chartTypes';
import { runAndIgnoreParseErrors } from '../utils/run';
import { chartAttributes } from './chartAttributes';
import Team, { type TeamModel } from './Team';
import type { UserModel } from './User';

const chartIdSaltSymbol = Symbol();
const hashPublishingSymbol = Symbol();

class Chart extends Model<InferAttributes<Chart>, InferCreationAttributes<Chart>> {
    declare id: string;
    declare type: string;
    declare title: string;
    declare theme: string;
    declare guest_session: string | null;
    declare last_edit_step: number | null;
    declare published_at: Date | null;
    declare last_modified_at: CreationOptional<Date>;
    declare public_url: string | null;
    declare public_version: number | null;
    declare deleted: boolean | null;
    declare deleted_at: Date | null;
    declare forkable: boolean | null;
    declare is_fork: boolean | null;

    declare metadata: Metadata;
    declare language: string;
    declare external_data: string | null;
    declare utf8: boolean | null;
    declare createdAt: CreationOptional<Date>;
    declare author_id: ForeignKey<number> | null;
    declare organization_id: ForeignKey<string> | null;
    declare in_folder: ForeignKey<number> | null;

    declare getUser: HasOneGetAssociationMixin<UserModel>;
    declare getTeam: HasOneGetAssociationMixin<TeamModel>;

    static [chartIdSaltSymbol]: string | undefined;
    static [hashPublishingSymbol]: string | undefined;

    async getPublicId() {
        if (this.id && Chart[chartIdSaltSymbol] && this.createdAt) {
            let hash = false;

            if (this.organization_id) {
                const team = await Team.findByPk(this.organization_id);
                hash = !!get(team, 'settings.publishTarget.hash_publishing');
            }

            if (Chart[hashPublishingSymbol]) {
                hash = true;
            }

            if (hash) {
                const hash = crypto.createHash('md5');
                hash.update(
                    `${this.id}--${this.createdAt.toISOString()}--${Chart[chartIdSaltSymbol]}`
                );
                return hash.digest('hex');
            }
        }

        return this.id;
    }

    async isEditableBy(user: UserModel | null, session: string | null) {
        if (this.deleted) return false;

        if (user && user.role !== 'guest') {
            return user.mayEditChart(this);
        } else if (session) {
            return !!this.guest_session && this.guest_session === session;
        }
        return false;
    }

    /**
     * Checks whether or not the authenticated user may edit the data
     * of the chart
     *
     * @param {User} user - instance of the User object
     * @param {string} session - session id
     * @returns {boolean}
     */
    async isDataEditableBy(user: UserModel, session: string) {
        const isEditable = await this.isEditableBy(user, session);
        if (!isEditable) return false;
        if (this.is_fork || this.metadata?.custom?.webToPrint?.mode === 'print') {
            return false;
        }
        return true;
    }

    async isPublishableBy(user: UserModel) {
        if (user) {
            // guests and pending users are not allowed to publish
            if (!user.isActivated()) return false;
            return user.mayEditChart(this);
        }
        return false;
    }

    getThumbnailHash() {
        if (!this.createdAt) {
            throw new Error("can't compute thumbnail hash without createdAt timestamp");
        }

        return crypto
            .createHash('md5')
            .update(`${this.id}--${this.createdAt.getTime() / 1000}`)
            .digest('hex');
    }

    // Use `runAndIgnoreParseErrors()`, so that the query doesn't crash when the user-provided
    // search string is not a valid MySQL full-text search string.
    static async findAndCountAllFullText(options: Parameters<typeof Chart.findAndCountAll>[0]) {
        const { count = 0, rows = [] } =
            (await runAndIgnoreParseErrors(() => Chart.findAndCountAll(options))) ?? {};
        return { count, rows };
    }

    static async countFullText(options: Parameters<typeof Chart.count>[0]) {
        return (await runAndIgnoreParseErrors(() => Chart.count(options))) ?? 0;
    }
}

setInitializer(exported, ({ initOptions, config }) => {
    Chart.init(chartAttributes, {
        updatedAt: 'last_modified_at',
        tableName: 'chart',
        ...initOptions
    });

    Chart.belongsTo(Chart, {
        foreignKey: 'forked_from'
    });

    Chart[chartIdSaltSymbol] = config.chartIdSalt;
    Chart[hashPublishingSymbol] = config.hashPublishing;

    return Chart;
});
