import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('stats')<typeof Stats>();
export default exported;

import SQ, { CreationOptional, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

class Stats extends Model<InferAttributes<Stats>, InferCreationAttributes<Stats>> {
    declare id: CreationOptional<number>;
    declare metric: string;
    declare value: number;
}

setInitializer(exported, ({ initOptions }) => {
    Stats.init(
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            metric: {
                type: SQ.STRING,
                allowNull: false
            },

            value: {
                type: SQ.INTEGER,
                allowNull: false
            }
        },
        {
            createdAt: 'time',
            tableName: 'stats',
            ...initOptions
        }
    );

    return Stats;
});
