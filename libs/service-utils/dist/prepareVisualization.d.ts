import type { Visualization } from './visualizationTypes';
/**
 * Prepares a visualization before it gets sent to client, so that only public props are exposed.
 */
declare const _default: (visualization: Visualization) => Partial<Visualization>;
export = _default;
