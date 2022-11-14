"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const pick_1 = __importDefault(require("lodash/pick"));
const INCLUDE_PROPERTIES = [
    'ariaLabel',
    'axes',
    'controls',
    'defaultMetadata',
    'dependencies',
    'height',
    'icon',
    'id',
    'includeInWorkflow',
    'libraries',
    'namespace',
    'options',
    'order',
    'supportsFitHeight',
    'title',
    'workflow',
    '__controlsHash',
    '__visHash',
    '__plugin',
    '__styleHash',
    '__title'
];
module.exports = function prepareVisualization(visualization) {
    return (0, pick_1.default)(visualization, INCLUDE_PROPERTIES);
};
