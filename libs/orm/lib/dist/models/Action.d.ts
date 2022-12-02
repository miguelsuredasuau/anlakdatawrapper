declare const exported: import("../utils/wrap").ExportedLite<"action", typeof Action>;
export default exported;
import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class Action extends Model<InferAttributes<Action>, InferCreationAttributes<Action>> {
    id: CreationOptional<number>;
    key: string;
    identifier: CreationOptional<string>;
    details: string;
    action_time: CreationOptional<Date>;
    user_id: ForeignKey<number> | null;
    /**
     * helper for logging a user action to the `action` table
     *
     * @param {integer} userId - user id
     * @param {string} key - the action key
     * @param {*} details - action details
     */
    static logAction(userId: number | null | undefined, key: string, details?: unknown): Promise<Action>;
}
