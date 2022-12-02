import type { PluginsInfo } from '@datawrapper/backend-utils';
import type { Sequelize } from 'sequelize';
type PluginsData = Record<string, Record<string, unknown> & {
    requirePath: string;
}>;
export declare function findPlugins(dwPluginsInfo: PluginsInfo): Promise<PluginsData>;
export declare function createRegisterPlugins(db: Sequelize, plugins: PluginsData): (logger?: {
    info(message: string): void;
} | undefined) => Promise<void>;
export {};
