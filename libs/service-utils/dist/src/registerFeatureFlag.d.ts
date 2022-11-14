import type { FeatureFlag } from './featureFlagTypes';
import type { Server } from './serverTypes';
declare const _default: (server: Server) => (id: string, attributes: Omit<FeatureFlag, 'id'>) => void;
export = _default;
