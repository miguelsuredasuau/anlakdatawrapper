import { createExports, getRawModelClass, setInitializer, type ExportedLite } from '../utils/wrap';
const exported: ExportedLite<'ReadonlyChart', ReadonlyChartType> =
    createExports('ReadonlyChart')<ReadonlyChartType>();
export default exported;

import pick from 'lodash/pick';
import Chart, { type ChartModel, type ChartClass } from './Chart';
import Team from './Team';
import User, { type UserModel } from './User';
import { chartAttributes } from './chartAttributes';
import type { ChartPublicModel } from './ChartPublic';

type ReadonlyChartModel = ChartModel & {
    get user(): UserModel | undefined;
};

type ReadonlyChartType = ChartClass & {
    fromChart(chart: ChartModel): ReadonlyChartModel;
    fromPublicChart(chart: ChartModel, publicChart: ChartPublicModel): ReadonlyChartModel;
};

setInitializer(exported, ({ initOptions }) => {
    class ReadonlyChart extends getRawModelClass(Chart) {
        get user(): UserModel | undefined {
            // TODO: Change how ReadonlyChart instance is used, so that we don't need to disable no-explicit-any.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (this.dataValues as any).user as UserModel;
        }

        static fromChart(chart: ChartModel): ReadonlyChartModel {
            // TODO: Change how ReadonlyChart instance is created, so that we don't need to disable no-explicit-any.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const readonlyChart = ReadonlyChart.build({ id: chart.id } as any);
            readonlyChart.dataValues = { ...chart.dataValues };
            return readonlyChart;
        }

        static fromPublicChart(
            chart: ChartModel,
            publicChart: ChartPublicModel
        ): ReadonlyChartModel {
            // TODO: Change how ReadonlyChart instance is created, so that we don't need to disable no-explicit-any.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const readonlyChart = ReadonlyChart.build({ id: chart.id } as any);
            const dataValues = {
                ...chart.dataValues,
                ...pick(publicChart.dataValues, [
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
            readonlyChart.dataValues = dataValues as any;
            return readonlyChart;
        }
    }

    ReadonlyChart.init(chartAttributes, {
        validate: {
            never() {
                throw new Error('ReadonlyChart can never be saved to the database');
            }
        },
        ...initOptions
    });

    ReadonlyChart.belongsTo(Chart, { foreignKey: 'forked_from' });
    ReadonlyChart.belongsTo(Team, { foreignKey: 'organization_id' });
    ReadonlyChart.belongsTo(User, { foreignKey: 'author_id' });

    return ReadonlyChart;
});
