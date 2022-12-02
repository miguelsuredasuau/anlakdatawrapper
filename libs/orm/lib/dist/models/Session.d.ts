declare const exported: import("../utils/wrap").ExportedLite<"session", typeof Session>;
export default exported;
export type SessionModel = InstanceType<typeof Session>;
import { InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
    id: string;
    user_id: number | null;
    persistent: boolean;
    data: Record<string, unknown>;
}
