import type { Server } from './serverTypes';
import type { Visualization } from './visualizationTypes';
declare const _default: (server: Server) => (plugin: string, visualizations?: Visualization[]) => Promise<void>;
export = _default;
