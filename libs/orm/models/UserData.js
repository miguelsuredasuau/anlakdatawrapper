const { createExports } = require('../utils/wrap');
module.exports = createExports();

const SQ = require('sequelize');
const User = require('./User');

module.exports.dwORM$setInitializer(({ db }) => {
    const UserData = db.define(
        'user_data',
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

            data: {
                type: SQ.TEXT,
                field: 'value'
            }
        },
        {
            createdAt: 'stored_at',
            tableName: 'user_data',
            indexes: [
                {
                    unique: true,
                    fields: ['user_id', 'key']
                }
            ]
        }
    );

    UserData.belongsTo(User, { foreignKey: 'user_id' });
    User.hasMany(UserData, { as: 'UserData' });

    /**
     * a quick way to retreive a user setting stored in user_data
     * @param {number} userId
     * @param {string} key
     * @param {string} _default - fallback value to be used if key not set yet
     * @returns the stored value
     */
    UserData.getUserData = async function (userId, key, _default = undefined) {
        const row = await UserData.findOne({
            where: { user_id: userId, key }
        });
        return row ? row.data : _default;
    };

    /**
     * a quick way to set or update a user setting in user_data
     * @param {number} userId
     * @param {string} key
     * @param {string} value
     */
    UserData.setUserData = async function (userId, key, value) {
        return db.query(
            'INSERT INTO user_data(user_id, `key`, value, stored_at) VALUES (:userId, :key, :value, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE value = :value, stored_at = CURRENT_TIMESTAMP',
            { replacements: { userId, key, value } }
        );
    };

    /**
     * a quick way to remove user setting in user_data
     * @param {number} userId
     * @param {string} key
     */
    UserData.unsetUserData = async function (userId, key) {
        if (!key) return;
        return UserData.destroy({
            where: {
                user_id: userId,
                key
            }
        });
    };

    return UserData;
});
