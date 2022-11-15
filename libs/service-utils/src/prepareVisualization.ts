import type { Visualization } from './visualizationTypes';
import pick from 'lodash/pick';

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

/**
 * Prepares a visualization before it gets sent to client, so that only public props are exposed.
 */
export function prepareVisualization(visualization: Visualization): Partial<Visualization> {
    return pick(visualization, INCLUDE_PROPERTIES);
}
