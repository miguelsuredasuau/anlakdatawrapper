import type { FeatureFlag } from './featureFlagTypes';
import type { Server } from './serverTypes';
export declare function registerFeatureFlag(server: Server): (id: string, attributes: Omit<FeatureFlag, 'id'>) => void;
