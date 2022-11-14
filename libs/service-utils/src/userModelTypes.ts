import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { Session } from './sessionModelTypes';
import type { Team } from './teamModelTypes';

/**
 * @see @datawrapper/orm/models/User.js
 */
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;

    declare email: string;
    declare pwd: string;

    declare activate_token: string;
    declare reset_password_token: string;

    declare role: 'admin' | 'editor' | 'pending' | 'guest' | 'sysadmin' | 'graphic-editor';

    declare deleted: CreationOptional<boolean>;
    declare language: CreationOptional<string>;
    declare created_at: CreationOptional<Date>;

    declare name: CreationOptional<string>;
    declare website: CreationOptional<string>;
    declare sm_profile: CreationOptional<string>;
    declare oauth_signin: CreationOptional<string>;
    declare customer_id: CreationOptional<string>;

    declare getActiveTeam: (session: Session | null) => Promise<Team | null>;
}
