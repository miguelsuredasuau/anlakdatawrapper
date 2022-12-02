import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('product')<typeof Product>();
export default exported;
export type ProductModel = InstanceType<typeof Product>;

import SQ, {
    CreationOptional,
    HasManyHasAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import type { PluginModel } from './Plugin';

class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
    declare id: CreationOptional<number>;
    declare name: string | null;
    declare deleted: boolean;
    declare priority: number;
    declare data: string;
    declare hasPlugin: HasManyHasAssociationMixin<PluginModel, string>;

    getData() {
        return this.data ? JSON.parse(this.data) : {};
    }

    hasFeature(key: string) {
        const data = this.getData();
        return !!data[key];
    }
}

setInitializer(exported, ({ initOptions }) => {
    Product.init(
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            name: {
                type: SQ.STRING(512),
                allowNull: false
            },

            deleted: {
                type: SQ.BOOLEAN,
                defaultValue: false
            },

            priority: {
                type: SQ.INTEGER,
                defaultValue: 0
            },

            data: SQ.TEXT
        },
        {
            tableName: 'product',
            ...initOptions
        }
    );

    return Product;
});
