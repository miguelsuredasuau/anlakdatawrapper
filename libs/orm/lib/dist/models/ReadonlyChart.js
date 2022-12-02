"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('ReadonlyChart')();
exports.default = exported;
const pick_1 = __importDefault(require("lodash/pick"));
const Chart_1 = __importDefault(require("./Chart"));
const Team_1 = __importDefault(require("./Team"));
const User_1 = __importDefault(require("./User"));
const chartAttributes_1 = require("./chartAttributes");
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    class ReadonlyChart extends (0, wrap_1.getRawModelClass)(Chart_1.default) {
        get user() {
            // TODO: Change how ReadonlyChart instance is used, so that we don't need to disable no-explicit-any.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return this.dataValues.user;
        }
        static fromChart(chart) {
            // TODO: Change how ReadonlyChart instance is created, so that we don't need to disable no-explicit-any.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const readonlyChart = ReadonlyChart.build({ id: chart.id });
            readonlyChart.dataValues = { ...chart.dataValues };
            return readonlyChart;
        }
        static fromPublicChart(chart, publicChart) {
            // TODO: Change how ReadonlyChart instance is created, so that we don't need to disable no-explicit-any.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const readonlyChart = ReadonlyChart.build({ id: chart.id });
            const dataValues = {
                ...chart.dataValues,
                ...(0, pick_1.default)(publicChart.dataValues, [
                    'type',
                    'title',
                    'metadata',
                    'external_data',
                    'author_id',
                    'organization_id'
                ])
            };
            // The original code violated type constraints
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            readonlyChart.dataValues = dataValues;
            return readonlyChart;
        }
    }
    ReadonlyChart.init(chartAttributes_1.chartAttributes, {
        validate: {
            never() {
                throw new Error('ReadonlyChart can never be saved to the database');
            }
        },
        ...initOptions
    });
    ReadonlyChart.belongsTo(Chart_1.default, { foreignKey: 'forked_from' });
    ReadonlyChart.belongsTo(Team_1.default, { foreignKey: 'organization_id' });
    ReadonlyChart.belongsTo(User_1.default, { foreignKey: 'author_id' });
    return ReadonlyChart;
});
