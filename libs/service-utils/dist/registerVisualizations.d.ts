import type { Server } from './serverTypes';
import type { Visualization } from './visualizationTypes';
export declare function createRegisterVisualization(server: Server): (plugin: string, visualizations?: Visualization[]) => Promise<void>;
