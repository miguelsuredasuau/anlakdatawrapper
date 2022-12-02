declare const exported: import("../utils/wrap").ExportedLite<"access_token", typeof AccessToken>;
export default exported;
export type AccessTokenModel = InstanceType<typeof AccessToken>;
import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class AccessToken extends Model<InferAttributes<AccessToken>, InferCreationAttributes<AccessToken>> {
    id: CreationOptional<number>;
    type: string;
    token: string;
    last_used_at: CreationOptional<Date>;
    data: Record<string, unknown>;
    user_id: ForeignKey<number>;
    static newToken({ user_id, type, data }: {
        user_id: number;
        type: string;
        data?: Record<string, unknown>;
    }): Promise<AccessToken>;
}
