declare const exported: import("../utils/wrap").ExportedLite<"plugin", typeof Plugin>;
export default exported;
export type PluginModel = InstanceType<typeof Plugin>;
import { CreationOptional, HasManyGetAssociationsMixin, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import type { PluginDataModel } from './PluginData';
declare class Plugin extends Model<InferAttributes<Plugin>, InferCreationAttributes<Plugin>> {
    id: CreationOptional<string>;
    enabled: boolean;
    is_private: boolean;
    getPluginData: HasManyGetAssociationsMixin<PluginDataModel>;
    static register(_app: unknown, plugins: string[]): Promise<void>;
}
