import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('access_token')<typeof AccessToken>();
export default exported;

import SQ, {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import generate from 'nanoid/generate';
import User from './User';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

class AccessToken extends Model<
    InferAttributes<AccessToken>,
    InferCreationAttributes<AccessToken>
> {
    declare id: CreationOptional<number>;
    declare type: string;
    declare token: string;
    declare last_used_at: CreationOptional<Date>;
    declare data: unknown;
    declare user_id: ForeignKey<number>;

    static async newToken({
        user_id,
        type,
        data
    }: {
        user_id: number;
        type: string;
        data?: unknown;
    }) {
        return AccessToken.create({
            user_id,
            type,
            data: data || {},
            token: generate(alphabet, 64)
        });
    }
}

setInitializer(exported, ({ initOptions }) => {
    AccessToken.init(
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            type: SQ.STRING(64),
            token: SQ.STRING(128),
            last_used_at: SQ.DATE,
            data: SQ.JSON
        },
        {
            tableName: 'access_token',
            ...initOptions
        }
    );

    AccessToken.belongsTo(User, { foreignKey: 'user_id' });

    return AccessToken;
});
