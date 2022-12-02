"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('chart')();
exports.default = exported;
const crypto_1 = __importDefault(require("crypto"));
const get_1 = __importDefault(require("lodash/get"));
const sequelize_1 = require("sequelize");
const run_1 = require("../utils/run");
const chartAttributes_1 = require("./chartAttributes");
const Team_1 = __importDefault(require("./Team"));
const chartIdSaltSymbol = Symbol();
const hashPublishingSymbol = Symbol();
class Chart extends sequelize_1.Model {
    static [chartIdSaltSymbol];
    static [hashPublishingSymbol];
    async getPublicId() {
        if (this.id && Chart[chartIdSaltSymbol] && this.createdAt) {
            let hash = false;
            if (this.organization_id) {
                const team = await Team_1.default.findByPk(this.organization_id);
                hash = !!(0, get_1.default)(team, 'settings.publishTarget.hash_publishing');
            }
            if (Chart[hashPublishingSymbol]) {
                hash = true;
            }
            if (hash) {
                const hash = crypto_1.default.createHash('md5');
                hash.update(`${this.id}--${this.createdAt.toISOString()}--${Chart[chartIdSaltSymbol]}`);
                return hash.digest('hex');
            }
        }
        return this.id;
    }
    async isEditableBy(user, session) {
        if (this.deleted)
            return false;
        if (user && user.role !== 'guest') {
            return user.mayEditChart(this);
        }
        else if (session) {
            return this.guest_session && this.guest_session === session;
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
    async isDataEditableBy(user, session) {
        const isEditable = await this.isEditableBy(user, session);
        if (!isEditable)
            return false;
        if (this.is_fork || this.metadata?.custom?.webToPrint?.mode === 'print') {
            return false;
        }
        return true;
    }
    async isPublishableBy(user) {
        if (user) {
            // guests and pending users are not allowed to publish
            if (!user.isActivated())
                return false;
            return user.mayEditChart(this);
        }
        return false;
    }
    getThumbnailHash() {
        if (!this.createdAt) {
            throw new Error("can't compute thumbnail hash without createdAt timestamp");
        }
        return crypto_1.default
            .createHash('md5')
            .update(`${this.id}--${this.createdAt.getTime() / 1000}`)
            .digest('hex');
    }
    // Use `runAndIgnoreParseErrors()`, so that the query doesn't crash when the user-provided
    // search string is not a valid MySQL full-text search string.
    static async findAndCountAllFullText(options) {
        const { count = 0, rows = [] } = (await (0, run_1.runAndIgnoreParseErrors)(() => Chart.findAndCountAll(options))) ?? {};
        return { count, rows };
    }
    static async countFullText(options) {
        return (await (0, run_1.runAndIgnoreParseErrors)(() => Chart.count(options))) ?? 0;
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions, config }) => {
    Chart.init(chartAttributes_1.chartAttributes, {
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
