import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('user_data')<typeof UserData>();
export default exported;
export type UserDataModel = InstanceType<typeof UserData>;

import SQ, {
    CreationOptional,
    FindOptions,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    QueryTypes,
    QueryOptionsWithType
} from 'sequelize';
import User from './User';

class UserData extends Model<InferAttributes<UserData>, InferCreationAttributes<UserData>> {
    declare id: CreationOptional<number>;
    declare key: string;
    declare data: string;
    declare user_id: ForeignKey<number>;

    /**
     * a quick way to retreive a user setting stored in user_data
     * @param {number} userId
     * @param {string} key
     * @param {string} _default - fallback value to be used if key not set yet
     * @param {object} [options] - options object
     * @param {object} [options.transaction=null] - database transactiosn
     * @returns {string} the stored value or `_default`
     */
    static async getUserData(
        userId: number,
        key: string,
        _default?: string,
        options?: Pick<FindOptions<InferAttributes<UserData>>, 'transaction'>
    ) {
        const row = await UserData.findOne({
            where: { user_id: userId, key },
            ...options
        });
        return row ? row.data : _default;
    }

    /**
     * a quick way to set or update a user setting in user_data
     * @param {number} userId
     * @param {string} key
     * @param {string} value
     * @param {object} [options] - options object
     * @param {object} [options.transaction=null] - database transactiosn
     */
    static async setUserData(
        userId: number,
        key: string,
        value: string,
        options?: Pick<QueryOptionsWithType<QueryTypes.RAW>, 'transaction'>
    ) {
        // TODO: Clean up this function, so that we don't need to disable `no-non-null-assertion`.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return UserData.sequelize!.query(
            'INSERT INTO user_data(user_id, `key`, value, stored_at) VALUES (:userId, :key, :value, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE value = :value, stored_at = CURRENT_TIMESTAMP',
            {
                replacements: { userId, key, value },
                type: QueryTypes.RAW,
                ...options
            }
        );
    }

    /**
     * a quick way to remove user setting in user_data
     * @param {number} userId
     * @param {string} key
     */
    static async unsetUserData(userId: number, key: string) {
        if (!key) return;
        return UserData.destroy({
            where: {
                user_id: userId,
                key
            }
        });
    }
}

setInitializer(exported, ({ initOptions }) => {
    UserData.init(
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            key: {
                type: SQ.STRING(128),
                allowNull: false
            },

            data: {
                type: SQ.TEXT,
                field: 'value'
            }
        },
        {
            createdAt: 'stored_at',
            tableName: 'user_data',
            indexes: [
                {
                    unique: true,
                    fields: ['user_id', 'key']
                }
            ],
            ...initOptions
        }
    );

    UserData.belongsTo(User, { foreignKey: 'user_id' });
    User.hasMany(UserData, { as: 'UserData' });

    return UserData;
});
