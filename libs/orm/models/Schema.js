const { createExports } = require('../utils/wrap');
module.exports = createExports();

const SQ = require('sequelize');

module.exports.dwORM$setInitializer(({ db }) => {
    const Schema = db.define(
        'schema',
        {
            scope: {
                type: SQ.STRING,
                primaryKey: true,
                autoIncrement: false
            },

            version: {
                type: SQ.INTEGER,
                allowNull: false
            }
        },
        {
            createdAt: false,
            tableName: 'schema'
        }
    );

    return Schema;
});
