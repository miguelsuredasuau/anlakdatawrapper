"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const assign_deep_1 = __importDefault(require("assign-deep"));
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const defaultChartMetadata_1 = __importDefault(require("./defaultChartMetadata"));
const camelizeTopLevelKeys_1 = __importDefault(require("./camelizeTopLevelKeys"));
module.exports = async function prepareChart(chart, additionalData = {}) {
    const { user, in_folder: folderId, ...dataValues } = chart.dataValues;
    const publicId = typeof chart.getPublicId === 'function' ? await chart.getPublicId() : undefined;
    const additionalMetadata = additionalData.metadata || {};
    return {
        ...(0, camelizeTopLevelKeys_1.default)(additionalData),
        publicId,
        language: 'en_US',
        theme: 'datawrapper',
        ...(0, camelizeTopLevelKeys_1.default)(dataValues),
        folderId,
        // allow overwriting of title and metadata with additionalData
        title: additionalData.title || dataValues.title,
        metadata: (0, assign_deep_1.default)((0, cloneDeep_1.default)(defaultChartMetadata_1.default), dataValues.metadata, additionalMetadata),
        author: user ? { name: user.name, email: user.email } : undefined,
        guestSession: undefined
    };
};
