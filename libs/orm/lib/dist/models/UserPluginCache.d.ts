declare const exported: import("../utils/wrap").ExportedLite<"user_plugin_cache", typeof UserPluginCache>;
export default exported;
export type UserPluginCacheModel = InstanceType<typeof UserPluginCache>;
import { ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class UserPluginCache extends Model<InferAttributes<UserPluginCache>, InferCreationAttributes<UserPluginCache>> {
    user_id: ForeignKey<number>;
    plugins: string;
}
