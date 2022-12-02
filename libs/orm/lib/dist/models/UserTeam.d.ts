declare const exported: import("../utils/wrap").ExportedLite<"user_team", typeof UserTeam>;
export default exported;
export type UserTeamModel = InstanceType<typeof UserTeam>;
import { ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
declare const teamRoleValues: readonly ["owner", "admin", "member"];
interface AdditionalRawAttributes {
    team_role: number | typeof teamRoleValues[number];
}
declare class UserTeam extends Model<InferAttributes<UserTeam> & AdditionalRawAttributes, InferCreationAttributes<UserTeam> & AdditionalRawAttributes> {
    user_id: ForeignKey<number>;
    organization_id: ForeignKey<string>;
    team_role: NonAttribute<typeof teamRoleValues[number]>;
    invite_token: string | undefined;
}
