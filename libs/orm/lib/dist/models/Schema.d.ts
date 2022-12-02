declare const exported: import("../utils/wrap").ExportedLite<"schema", typeof Schema>;
export default exported;
import { InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class Schema extends Model<InferAttributes<Schema>, InferCreationAttributes<Schema>> {
    scope: string;
    version: number;
}
