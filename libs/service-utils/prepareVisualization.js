/**
 * Prepares a visualization before it gets sent to client,
 * so that only public properties are exposed
 *
 * @param {object} visualization
 * @returns {object}
 */
const INCLUDE_PROPERTIES = new Set([
    'id',
    'title',
    'ariaLabel',
    'controls',
    'dependencies',
    'axes',
    'defaultMetadata',
    'namespace',
    'libraries',
    'icon',
    '__title',
    '__styleHash',
    '__controlsHash',
    '__plugin'
]);

module.exports = function prepareVisualization(visualization) {
    return Object.fromEntries(
        Object.entries(visualization).filter(([key]) => INCLUDE_PROPERTIES.has(key))
    );
};
