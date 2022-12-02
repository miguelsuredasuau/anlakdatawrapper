declare const exported: import("../utils/wrap").ExportedLite<"session", typeof Session>;
export default exported;
export type SessionModel = InstanceType<typeof Session>;
import { InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
interface AdditionalRawAttributes {
    data: string;
}
declare class Session extends Model<InferAttributes<Session> & AdditionalRawAttributes, InferCreationAttributes<Session> & AdditionalRawAttributes> {
    id: string;
    user_id: number | null;
    persistent: boolean;
    data: NonAttribute<Record<string, unknown>>;
}
