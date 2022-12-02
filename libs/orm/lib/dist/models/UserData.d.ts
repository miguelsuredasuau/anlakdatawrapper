declare const exported: import("../utils/wrap").ExportedLite<"user_data", typeof UserData>;
export default exported;
export type UserDataModel = InstanceType<typeof UserData>;
import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class UserData extends Model<InferAttributes<UserData>, InferCreationAttributes<UserData>> {
    id: CreationOptional<number>;
    key: string;
    data: string;
    user_id: ForeignKey<number>;
    /**
     * a quick way to retreive a user setting stored in user_data
     * @param {number} userId
     * @param {string} key
     * @param {string} _default - fallback value to be used if key not set yet
     * @returns the stored value
     */
    static getUserData(userId: number, key: string, _default?: string): Promise<string | undefined>;
    /**
     * a quick way to set or update a user setting in user_data
     * @param {number} userId
     * @param {string} key
     * @param {string} value
     */
    static setUserData(userId: number, key: string, value: string): Promise<[unknown[], unknown]>;
    /**
     * a quick way to remove user setting in user_data
     * @param {number} userId
     * @param {string} key
     */
    static unsetUserData(userId: number, key: string): Promise<number | undefined>;
}
