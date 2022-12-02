declare const exported: import("../utils/wrap").ExportedLite<"team_theme", typeof TeamTheme>;
export default exported;
import { InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare class TeamTheme extends Model<InferAttributes<TeamTheme>, InferCreationAttributes<TeamTheme>> {
}
