const { createExports } = require('../utils/wrap');
module.exports = createExports();

const SQ = require('sequelize');
const User = require('./User');

module.exports.dwORM$setInitializer(({ db }) => {
    const UserPluginCache = db.define(
        'user_plugin_cache',
        {
            user_id: {
                type: SQ.INTEGER,
                primaryKey: true
            },
            plugins: SQ.TEXT
        },
        {
            tableName: 'user_plugin_cache',
            timestamps: false
        }
    );

    UserPluginCache.belongsTo(User);
    User.hasOne(UserPluginCache, {
        as: 'UserPluginCache',
        timestamps: false,
        foreignKey: 'user_id'
    });

    return UserPluginCache;
});
