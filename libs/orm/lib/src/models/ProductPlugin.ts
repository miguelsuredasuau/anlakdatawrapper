import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('product_plugin')<typeof ProductPlugin>();
export default exported;

import { InferAttributes, InferCreationAttributes, Model } from 'sequelize';

import Plugin from './Plugin';
import Product from './Product';

class ProductPlugin extends Model<
    InferAttributes<ProductPlugin>,
    InferCreationAttributes<ProductPlugin>
> {}

setInitializer(exported, ({ initOptions }) => {
    ProductPlugin.init(
        {},
        {
            tableName: 'product_plugin',
            timestamps: false,
            ...initOptions
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
