const { createExports } = require('../utils/wrap');
module.exports = createExports();

const SQ = require('sequelize');
const Plugin = require('./Plugin');

module.exports.dwORM$setInitializer(({ db }) => {
    const PluginData = db.define(
        'plugin_data',
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

            data: SQ.TEXT
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
            ]
        }
    );

    PluginData.getJSONData = async function (pluginId, key) {
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
    };

    PluginData.belongsTo(Plugin, { foreignKey: 'plugin_id' });
    Plugin.hasMany(PluginData, { as: 'PluginData' });

    return PluginData;
});
