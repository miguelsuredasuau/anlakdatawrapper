const { createExports } = require('../utils/wrap');
module.exports = createExports();

const Plugin = require('./Plugin');
const Product = require('./Product');

module.exports.dwORM$setInitializer(({ db }) => {
    const ProductPlugin = db.define(
        'product_plugin',
        {},
        {
            tableName: 'product_plugin',
            timestamps: false
        }
    );

    Plugin.belongsToMany(Product, {
        through: ProductPlugin,
        timestamps: false
    });

    Product.belongsToMany(Plugin, {
        through: ProductPlugin,
        timestamps: false
    });

    return ProductPlugin;
});
