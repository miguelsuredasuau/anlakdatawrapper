const { createExports } = require('../utils/wrap');
module.exports = createExports();

const SQ = require('sequelize');
const generate = require('nanoid/generate');
const User = require('./User');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

module.exports.dwORM$setInitializer(({ db }) => {
    const AccessToken = db.define(
        'access_token',
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            type: SQ.STRING(64),
            token: SQ.STRING(128),
            last_used_at: SQ.DATE,
            data: SQ.JSON
        },
        {
            tableName: 'access_token'
        }
    );

    // Adding a class level method
    AccessToken.newToken = async function ({ user_id, type, data }) {
        return AccessToken.create({
            user_id,
            type,
            data: data || {},
            token: generate(alphabet, 64)
        });
    };

    AccessToken.belongsTo(User, { foreignKey: 'user_id' });

    return AccessToken;
});
