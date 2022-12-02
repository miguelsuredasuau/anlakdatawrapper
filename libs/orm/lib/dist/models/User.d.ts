declare const exported: import("../utils/wrap").ExportedLite<"user", typeof User>;
export default exported;
export type UserModel = InstanceType<typeof User>;
import SQ, { CreationOptional, HasManyGetAssociationsMixin, HasOneGetAssociationMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
import type { ChartModel } from './Chart';
import type { FolderModel } from './Folder';
import { type PluginModel } from './Plugin';
import { type ProductModel } from './Product';
import type { SessionModel } from './Session';
import { type TeamModel } from './Team';
import type { ThemeModel } from './Theme';
import { type UserDataModel } from './UserData';
import type { UserPluginCacheModel } from './UserPluginCache';
declare class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    id: CreationOptional<number>;
    email: string | null;
    pwd: string | null;
    activate_token: string | null;
    reset_password_token: string | null;
    role: 'admin' | 'editor' | 'pending' | 'guest' | 'sysadmin' | 'graphic-editor';
    deleted: boolean | null;
    language: string;
    created_at: CreationOptional<Date>;
    name: string | null;
    website: string | null;
    sm_profile: string | null;
    oauth_signin: string | null;
    customer_id: string | null;
    getProducts: HasManyGetAssociationsMixin<ProductModel>;
    getTeams: HasManyGetAssociationsMixin<TeamModel>;
    getUserPluginCache: HasOneGetAssociationMixin<UserPluginCacheModel>;
    getFolders: HasManyGetAssociationsMixin<FolderModel>;
    getThemes: HasManyGetAssociationsMixin<ThemeModel>;
    getUserData: HasOneGetAssociationMixin<UserDataModel>;
    teams?: NonAttribute<TeamModel[]>;
    getCharts: HasManyGetAssociationsMixin<any>;
    serialize(): Pick<SQ.InferAttributes<User, {
        omit: never;
    }>, "id" | "name" | "email" | "role" | "language" | "website" | "sm_profile" | "oauth_signin">;
    isAdmin(): boolean;
    isActivated(): boolean;
    mayEditChart(chart: ChartModel): Promise<boolean>;
    hasActivatedTeam(teamId: string): Promise<boolean>;
    mayAdministrateTeam(teamId: string): Promise<boolean>;
    getAllProducts(): Promise<ProductModel[]>;
    mayUsePlugin(pluginId: string): Promise<boolean>;
    getPlugins(): Promise<PluginModel[]>;
    getActiveProduct(): Promise<ProductModel | null>;
    getAcceptedTeams(): Promise<TeamModel[]>;
    getActiveTeam(session?: SessionModel | null): Promise<TeamModel | null | undefined>;
    getActiveTeamIds(): Promise<string[]>;
}
