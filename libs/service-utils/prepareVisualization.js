/**
 * Prepares a visualization before it gets sent to client,
 * so that only public properties are exposed
 *
 * @param {object} visualization
 * @returns {object}
 */
const INCLUDE_PROPERTIES = new Set([
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
    'title',
    'workflow',
    '__controlsHash',
    '__plugin',
    '__styleHash',
    '__title'
]);

module.exports = function prepareVisualization(visualization) {
    return Object.fromEntries(
        Object.entries(visualization).filter(([key]) => INCLUDE_PROPERTIES.has(key))
    );
};
