import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { User } from './userModelTypes';
declare type TeamSettings = {
    [key: string]: unknown;
};
/**
 * @see @datawrapper/orm/models/Team.js
 */
export declare class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
    id: CreationOptional<string>;
    name: string;
    settings: TeamSettings;
    getPublicSettings: () => TeamSettings;
    hasUser: (user: User) => Promise<boolean>;
    default_theme?: string;
}
export {};
