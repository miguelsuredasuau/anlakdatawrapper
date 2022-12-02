import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('session')<typeof Session>();
export default exported;
export type SessionModel = InstanceType<typeof Session>;

import SQ, { InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { serializeSession, unserializeSession } from '../utils/phpSerialize';

class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
    declare id: string;
    declare user_id: number | null;
    declare persistent: boolean;
    declare data: Record<string, unknown>;
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
                        // Sequelize v6 types do not support model field and DB field having different types https://github.com/sequelize/sequelize/issues/13522
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const data = unserializeSession(d as any);
                        return data;
                    }
                    return {};
                },
                set(data) {
                    // WARNING, this will destroy parts of our sessions
                    // Sequelize v6 types do not support model field and DB field having different types https://github.com/sequelize/sequelize/issues/13522
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.setDataValue('data', serializeSession(data) as any);
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
