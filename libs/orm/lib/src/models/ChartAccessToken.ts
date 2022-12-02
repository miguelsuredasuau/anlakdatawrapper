import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('chart_access_token')<typeof ChartAccessToken>();
export default exported;

import SQ, {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import generate from 'nanoid/generate';
import Chart from './Chart';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/*
 * this model is deprecated, we'll switch to AccessToken some day
 */
class ChartAccessToken extends Model<
    InferAttributes<ChartAccessToken>,
    InferCreationAttributes<ChartAccessToken>
> {
    declare id: CreationOptional<number>;
    declare token: string;
    declare chart_id: ForeignKey<string>;

    static async newToken({ chart_id }: { chart_id: string }) {
        return ChartAccessToken.create({
            chart_id,
            token: generate(alphabet, 32)
        });
    }
}

setInitializer(exported, ({ initOptions }) => {
    ChartAccessToken.init(
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            token: SQ.STRING(128)
        },
        {
            tableName: 'chart_access_token',
            ...initOptions
        }
    );

    ChartAccessToken.belongsTo(Chart, { foreignKey: 'chart_id' });

    return ChartAccessToken;
});
