const assignDeep = require('assign-deep');
const cloneDeep = require('lodash/cloneDeep');
const defaultChartMetadata = require('./defaultChartMetadata.js');
const camelizeTopLevelKeys = require('./camelizeTopLevelKeys.js');

/**
 * Prepares a chart before it gets send to client
 *
 * This will extend the metadata from the defaultChartMetadata
 * to make sure our editor functions properly.
 *
 * @param {object} chart
 * @param {object} additionalData
 * @returns {object}
 */
module.exports = async function prepareChart(chart, additionalData = {}) {
    const { user, in_folder: folderId, ...dataValues } = chart.dataValues;

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
};
