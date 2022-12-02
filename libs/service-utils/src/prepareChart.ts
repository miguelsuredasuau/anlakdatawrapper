import assignDeep from 'assign-deep';
import cloneDeep from 'lodash/cloneDeep';
import { defaultChartMetadata } from './defaultChartMetadata';
import { camelizeTopLevelKeys } from './camelizeTopLevelKeys';
import type { ChartDataValues, PreparedChart } from './chartModelTypes';
import type { ChartModel, UserModel } from '@datawrapper/orm';

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
export async function prepareChart(
    chart: ChartModel,
    additionalData: Partial<ChartDataValues> = {}
): Promise<PreparedChart> {
    const {
        user,
        in_folder: folderId,
        ...dataValues
    } = chart.dataValues as typeof chart.dataValues & { user: UserModel };

    const publicId =
        typeof chart.getPublicId === 'function' ? await chart.getPublicId() : undefined;

    const additionalMetadata = additionalData.metadata || {};

    return {
        ...camelizeTopLevelKeys(additionalData),
        publicId,
        language: 'en_US',
        theme: 'datawrapper',
        ...camelizeTopLevelKeys(dataValues),
        folderId,
        // allow overwriting of title and metadata with additionalData
        title: additionalData.title || dataValues.title,
        metadata: assignDeep(
            cloneDeep(defaultChartMetadata),
            dataValues.metadata,
            additionalMetadata
        ),
        author: user ? { name: user.name, email: user.email } : undefined,
        guestSession: undefined
    };
}
