import type { Chart, ChartDataValues, PreparedChart } from './chartModelTypes';
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
declare const _default: (chart: Chart, additionalData?: Partial<ChartDataValues>) => Promise<PreparedChart>;
export = _default;
