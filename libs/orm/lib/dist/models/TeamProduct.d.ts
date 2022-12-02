declare const exported: import("../utils/wrap").ExportedLite<"team_product", typeof TeamProduct>;
export default exported;
import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class TeamProduct extends Model<InferAttributes<TeamProduct>, InferCreationAttributes<TeamProduct>> {
    created_by_admin: CreationOptional<boolean>;
    changes: string | undefined;
    expires: Date | undefined;
    organization_id: ForeignKey<string>;
    productId: ForeignKey<number>;
}
