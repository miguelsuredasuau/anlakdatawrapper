declare const exported: import("../utils/wrap").ExportedLite<"user_team", typeof UserTeam>;
export default exported;
export type UserTeamModel = InstanceType<typeof UserTeam>;
import { ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
declare const teamRoleValues: readonly ["owner", "admin", "member"];
declare class UserTeam extends Model<InferAttributes<UserTeam>, InferCreationAttributes<UserTeam>> {
    user_id: ForeignKey<number>;
    organization_id: ForeignKey<string>;
    team_role: typeof teamRoleValues[number];
    invite_token: string | undefined;
}
