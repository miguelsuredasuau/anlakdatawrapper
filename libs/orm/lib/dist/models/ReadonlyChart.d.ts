import { type ExportedLite } from '../utils/wrap';
declare const exported: ExportedLite<'ReadonlyChart', ReadonlyChartType>;
export default exported;
import { type ChartModel, type ChartClass } from './Chart';
import { type UserModel } from './User';
import type { ChartPublicModel } from './ChartPublic';
type ReadonlyChartModel = ChartModel & {
    get user(): UserModel | undefined;
};
type ReadonlyChartType = ChartClass & {
    fromChart(chart: ChartModel): ReadonlyChartModel;
    fromPublicChart(chart: ChartModel, publicChart: ChartPublicModel): ReadonlyChartModel;
};
