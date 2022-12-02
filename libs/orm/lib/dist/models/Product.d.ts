declare const exported: import("../utils/wrap").ExportedLite<"product", typeof Product>;
export default exported;
export type ProductModel = InstanceType<typeof Product>;
import { CreationOptional, HasManyHasAssociationMixin, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import type { PluginModel } from './Plugin';
declare class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
    id: CreationOptional<number>;
    name: string | null;
    deleted: boolean;
    priority: number;
    data: string;
    hasPlugin: HasManyHasAssociationMixin<PluginModel, string>;
    getData(): any;
    hasFeature(key: string): boolean;
}
