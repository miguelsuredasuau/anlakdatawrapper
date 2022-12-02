declare const exported: import("../utils/wrap").ExportedLite<"stats", typeof Stats>;
export default exported;
import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class Stats extends Model<InferAttributes<Stats>, InferCreationAttributes<Stats>> {
    id: CreationOptional<number>;
    metric: string;
    value: number;
}
