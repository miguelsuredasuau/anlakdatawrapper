const { createExports } = require('../utils/wrap');
module.exports = createExports();

const SQ = require('sequelize');
const User = require('./User');

module.exports.dwORM$setInitializer(({ db }) => {
    const Action = db.define(
        'action',
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            key: SQ.STRING(512),
            identifier: SQ.STRING(512),
            details: SQ.STRING(512)
        },
        {
            createdAt: 'action_time',
            tableName: 'action'
        }
    );

    Action.belongsTo(User, { foreignKey: 'user_id' });

    /**
     * helper for logging a user action to the `action` table
     *
     * @param {integer} userId - user id
     * @param {string} key - the action key
     * @param {*} details - action details
     */
    Action.logAction = async function (userId, key, details) {
        return Action.create({
            key: key,
            user_id: userId,
            details:
                typeof details !== 'number' && typeof details !== 'string'
                    ? JSON.stringify(details)
                    : details
        });
    };

    return Action;
});
