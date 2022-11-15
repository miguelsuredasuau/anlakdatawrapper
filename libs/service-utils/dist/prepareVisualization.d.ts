import type { Visualization } from './visualizationTypes';
/**
 * Prepares a visualization before it gets sent to client, so that only public props are exposed.
 */
export declare function prepareVisualization(visualization: Visualization): Partial<Visualization>;
