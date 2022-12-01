const { createExports } = require('../utils/wrap');
module.exports = createExports();

const SQ = require('sequelize');
const User = require('./User');
const Product = require('./Product');

module.exports.dwORM$setInitializer(({ db }) => {
    const UserProduct = db.define(
        'user_product',
        {
            user_id: SQ.INTEGER,
            product_id: SQ.INTEGER,
            created_by_admin: {
                type: SQ.BOOLEAN,
                defaultValue: true
            },

            changes: SQ.TEXT,

            expires: SQ.DATE
        },
        {
            tableName: 'user_product',
            timestamps: false
        }
    );

    User.belongsToMany(Product, {
        through: UserProduct,
        timestamps: false
    });

    Product.belongsToMany(User, {
        through: UserProduct,
        timestamps: false
    });

    return UserProduct;
});
