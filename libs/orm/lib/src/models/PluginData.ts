import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('plugin_data')<typeof PluginData>();
export default exported;
export type PluginDataModel = InstanceType<typeof PluginData>;

import SQ, {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';

import Plugin from './Plugin';

class PluginData extends Model<InferAttributes<PluginData>, InferCreationAttributes<PluginData>> {
    declare id: CreationOptional<number>;
    declare key: string;
    declare data: string;
    declare stored_at: Date;
    declare plugin_id: ForeignKey<string>;

    static async getJSONData(pluginId: string, key: string) {
        const pluginDataItem = await PluginData.findOne({
            attributes: ['data'],
            where: {
                plugin_id: pluginId,
                key
            },
            order: [['stored_at', 'DESC']]
        });
        if (!pluginDataItem) {
            return [];
        }
        return JSON.parse(pluginDataItem.data);
    }
}

setInitializer(exported, ({ initOptions }) => {
    PluginData.init(
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            key: {
                type: SQ.STRING(128),
                allowNull: false
            },

            data: SQ.TEXT,

            stored_at: SQ.DATE
        },
        {
            createdAt: 'stored_at',
            tableName: 'plugin_data',
            indexes: [
                {
                    type: 'UNIQUE',
                    name: 'plugin_data_IDX_plugin_id_key',
                    fields: ['plugin_id', 'key']
                }
            ],
            ...initOptions
        }
    );

    PluginData.belongsTo(Plugin, { foreignKey: 'plugin_id' });
    Plugin.hasMany(PluginData, { as: 'PluginData' });

    return PluginData;
});
