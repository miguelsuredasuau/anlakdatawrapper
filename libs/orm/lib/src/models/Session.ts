import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('session')<typeof Session>();
export default exported;
export type SessionModel = InstanceType<typeof Session>;

import SQ, { InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
import { serializeSession, unserializeSession } from '../utils/phpSerialize';

interface AdditionalRawAttributes {
    data: string;
}

class Session extends Model<
    InferAttributes<Session> & AdditionalRawAttributes,
    InferCreationAttributes<Session> & AdditionalRawAttributes
> {
    declare id: string;
    declare user_id: number | null;
    declare persistent: boolean;
    declare data: NonAttribute<Record<string, unknown>>;
}

setInitializer(exported, ({ initOptions }) => {
    Session.init(
        {
            id: {
                type: SQ.STRING(32),
                primaryKey: true,
                autoIncrement: false,
                field: 'session_id'
            },

            user_id: {
                type: SQ.INTEGER,
                allowNull: true
            },

            persistent: SQ.BOOLEAN,

            data: {
                type: SQ.TEXT,
                allowNull: false,
                field: 'session_data',
                get() {
                    const d = this.getDataValue('data');
                    if (d) {
                        const data = unserializeSession(d);
                        return data;
                    }
                    return {};
                },
                set(data) {
                    // WARNING, this will destroy parts of our sessions
                    this.setDataValue('data', serializeSession(data));
                }
            }
        },
        {
            createdAt: 'date_created',
            updatedAt: 'last_updated',
            tableName: 'session',
            ...initOptions
        }
    );

    return Session;
});
