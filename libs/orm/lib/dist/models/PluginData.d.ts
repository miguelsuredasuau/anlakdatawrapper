declare const exported: import("../utils/wrap").ExportedLite<"plugin_data", typeof PluginData>;
export default exported;
export type PluginDataModel = InstanceType<typeof PluginData>;
import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class PluginData extends Model<InferAttributes<PluginData>, InferCreationAttributes<PluginData>> {
    id: CreationOptional<number>;
    key: string;
    data: string;
    stored_at: Date;
    plugin_id: ForeignKey<string>;
    static getJSONData(pluginId: string, key: string): Promise<any>;
}
