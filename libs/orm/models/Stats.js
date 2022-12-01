const { createExports } = require('../utils/wrap');
module.exports = createExports();

const SQ = require('sequelize');

module.exports.dwORM$setInitializer(({ db }) => {
    const Stats = db.define(
        'stats',
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            metric: {
                type: SQ.STRING,
                allowNull: false
            },

            value: {
                type: SQ.INTEGER,
                allowNull: false
            }
        },
        {
            createdAt: 'time',
            tableName: 'stats'
        }
    );

    return Stats;
});
