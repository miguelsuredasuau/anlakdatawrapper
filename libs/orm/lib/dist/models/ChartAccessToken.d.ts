declare const exported: import("../utils/wrap").ExportedLite<"chart_access_token", typeof ChartAccessToken>;
export default exported;
import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class ChartAccessToken extends Model<InferAttributes<ChartAccessToken>, InferCreationAttributes<ChartAccessToken>> {
    id: CreationOptional<number>;
    token: string;
    chart_id: ForeignKey<string>;
    static newToken({ chart_id }: {
        chart_id: string;
    }): Promise<ChartAccessToken>;
}
