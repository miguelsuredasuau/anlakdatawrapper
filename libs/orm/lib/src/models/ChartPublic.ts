import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('chart_public')<typeof ChartPublic>();
export default exported;
export type ChartPublicModel = InstanceType<typeof ChartPublic>;

import SQ, {
    CreationOptional,
    HasOneGetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import Chart, { type ChartModel } from './Chart';

class ChartPublic extends Model<
    InferAttributes<ChartPublic>,
    InferCreationAttributes<ChartPublic>
> {
    declare id: CreationOptional<string>;
    declare type: string;
    declare title: string;
    declare metadata: unknown;
    declare external_data: string;
    declare first_published_at: CreationOptional<Date>;
    declare author_id: number;
    declare organization_id: string;

    declare getChart: HasOneGetAssociationMixin<ChartModel>;
}

setInitializer(exported, ({ initOptions }) => {
    ChartPublic.init(
        {
            id: { type: SQ.STRING(5), primaryKey: true },
            type: SQ.STRING,
            title: SQ.STRING,
            metadata: SQ.JSON,
            external_data: SQ.STRING(),
            first_published_at: SQ.DATE(),
            author_id: SQ.INTEGER(),
            organization_id: SQ.STRING(128)
        },
        {
            tableName: 'chart_public',
            createdAt: 'first_published_at',
            ...initOptions
        }
    );

    ChartPublic.belongsTo(Chart, { foreignKey: 'id' });
    Chart.hasOne(ChartPublic, { foreignKey: 'id' });

    return ChartPublic;
});
