const SQ = require('sequelize');
const { db } = require('../index');

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

module.exports = Schema;
