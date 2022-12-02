declare const exported: import("../utils/wrap").ExportedLite<"chart_public", typeof ChartPublic>;
export default exported;
export type ChartPublicModel = InstanceType<typeof ChartPublic>;
import { CreationOptional, HasOneGetAssociationMixin, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { type ChartModel } from './Chart';
declare class ChartPublic extends Model<InferAttributes<ChartPublic>, InferCreationAttributes<ChartPublic>> {
    id: CreationOptional<string>;
    type: string;
    title: string;
    metadata: unknown;
    external_data: string;
    first_published_at: CreationOptional<Date>;
    author_id: number;
    organization_id: string;
    getChart: HasOneGetAssociationMixin<ChartModel>;
}
