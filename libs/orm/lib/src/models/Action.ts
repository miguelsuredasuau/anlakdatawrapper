import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('action')<typeof Action>();
export default exported;

import SQ, {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import User from './User';

class Action extends Model<InferAttributes<Action>, InferCreationAttributes<Action>> {
    declare id: CreationOptional<number>;
    declare key: string;
    declare identifier: CreationOptional<string>;
    declare details: string;
    declare action_time: CreationOptional<Date>;
    declare user_id: ForeignKey<number> | null;

    /**
     * helper for logging a user action to the `action` table
     *
     * @param {integer} userId - user id
     * @param {string} key - the action key
     * @param {*} details - action details
     */
    static async logAction(userId: number | null | undefined, key: string, details?: unknown) {
        return Action.create({
            key: key,
            user_id: userId ?? null,
            details:
                typeof details !== 'number' && typeof details !== 'string'
                    ? JSON.stringify(details)
                    : String(details)
        });
    }
}

setInitializer(exported, ({ initOptions }) => {
    Action.init(
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            key: SQ.STRING(512),
            identifier: SQ.STRING(512),
            details: SQ.STRING(512),
            action_time: SQ.DATE
        },
        {
            createdAt: 'action_time',
            tableName: 'action',
            ...initOptions
        }
    );

    Action.belongsTo(User, { foreignKey: 'user_id' });

    return Action;
});
