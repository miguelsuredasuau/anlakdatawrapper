import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { Session } from './sessionModelTypes';
import type { Team } from './teamModelTypes';
/**
 * @see @datawrapper/orm/models/User.js
 */
export declare class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    id: CreationOptional<number>;
    email: string;
    pwd: string;
    activate_token: string;
    reset_password_token: string;
    role: 'admin' | 'editor' | 'pending' | 'guest' | 'sysadmin' | 'graphic-editor';
    deleted: CreationOptional<boolean>;
    language: CreationOptional<string>;
    created_at: CreationOptional<Date>;
    name: CreationOptional<string>;
    website: CreationOptional<string>;
    sm_profile: CreationOptional<string>;
    oauth_signin: CreationOptional<string>;
    customer_id: CreationOptional<string>;
    getActiveTeam: (session: Session | null) => Promise<Team | null>;
}
