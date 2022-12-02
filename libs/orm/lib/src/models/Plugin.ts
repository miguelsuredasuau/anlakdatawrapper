import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('plugin')<typeof Plugin>();
export default exported;
export type PluginModel = InstanceType<typeof Plugin>;

import SQ, {
    CreationOptional,
    HasManyGetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import type { PluginDataModel } from './PluginData';

class Plugin extends Model<InferAttributes<Plugin>, InferCreationAttributes<Plugin>> {
    declare id: CreationOptional<string>;
    declare enabled: boolean;
    declare is_private: boolean;
    declare getPluginData: HasManyGetAssociationsMixin<PluginDataModel>;

    /*
     * use Plugin.register to make sure the apps' plugin show
     * up in the plugin database table
     */
    static async register(_app: unknown, plugins: string[]) {
        // make sure the plugins are in the plugin list
        await Plugin.bulkCreate(
            plugins.map(p => {
                return {
                    id: p.replace('@datawrapper/plugin-', ''),
                    enabled: true,
                    is_private: false
                };
            }),
            { ignoreDuplicates: true }
        );
    }
}

setInitializer(exported, ({ initOptions }) => {
    Plugin.init(
        {
            id: {
                type: SQ.STRING(128),
                primaryKey: true
            },

            enabled: SQ.BOOLEAN,
            is_private: SQ.BOOLEAN // soon to be deprectad
        },
        {
            createdAt: 'installed_at',
            tableName: 'plugin',
            ...initOptions
        }
    );

    return Plugin;
});
