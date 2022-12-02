import type { ChartDataValues, PreparedChart } from './chartModelTypes';
import type { ChartModel } from '@datawrapper/orm';
/**
 * Prepares a chart before it gets send to client
 *
 * This will extend the metadata from the defaultChartMetadata
 * to make sure our editor functions properly.
 *
 * @param {Object} chart
 * @param {Object} additionalData
 * @returns {Object}
 */
export declare function prepareChart(chart: ChartModel, additionalData?: Partial<ChartDataValues>): Promise<PreparedChart>;
