const { createExports } = require('../utils/wrap');
module.exports = createExports();

const SQ = require('sequelize');
const Team = require('./Team');
const Product = require('./Product');

module.exports.dwORM$setInitializer(({ db }) => {
    const TeamProduct = db.define(
        'team_product',
        {
            created_by_admin: {
                type: SQ.BOOLEAN,
                defaultValue: true
            },

            changes: SQ.TEXT,

            expires: SQ.DATE
        },
        {
            tableName: 'organization_product',
            timestamps: false
        }
    );

    Team.belongsToMany(Product, {
        through: TeamProduct,
        foreignKey: 'organization_id',
        timestamps: false
    });

    Product.belongsToMany(Team, {
        through: TeamProduct,
        timestamps: false
    });

    return TeamProduct;
});
