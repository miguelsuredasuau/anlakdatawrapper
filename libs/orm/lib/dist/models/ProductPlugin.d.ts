declare const exported: import("../utils/wrap").ExportedLite<"product_plugin", typeof ProductPlugin>;
export default exported;
import { InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class ProductPlugin extends Model<InferAttributes<ProductPlugin>, InferCreationAttributes<ProductPlugin>> {
}
