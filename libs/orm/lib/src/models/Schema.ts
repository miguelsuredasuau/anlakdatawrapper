import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('schema')<typeof Schema>();
export default exported;

import SQ, { InferAttributes, InferCreationAttributes, Model } from 'sequelize';

class Schema extends Model<InferAttributes<Schema>, InferCreationAttributes<Schema>> {
    declare scope: string;
    declare version: number;
}

setInitializer(exported, ({ initOptions }) => {
    Schema.init(
        {
            scope: {
                type: SQ.STRING,
                primaryKey: true,
                autoIncrement: false
            },

            version: {
                type: SQ.INTEGER,
                allowNull: false
            }
        },
        {
            createdAt: false,
            tableName: 'schema',
            ...initOptions
        }
    );

    return Schema;
});
