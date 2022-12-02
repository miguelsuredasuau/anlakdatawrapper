declare const exported: import("../utils/wrap").ExportedLite<"user_product", typeof UserProduct>;
export default exported;
import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class UserProduct extends Model<InferAttributes<UserProduct>, InferCreationAttributes<UserProduct>> {
    userId: ForeignKey<number>;
    user_id: ForeignKey<number> | null;
    productId: ForeignKey<number>;
    product_id: ForeignKey<number> | null;
    created_by_admin: CreationOptional<boolean>;
    changes: string | undefined;
    expires: Date | undefined;
}
