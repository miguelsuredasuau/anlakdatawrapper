import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { User } from './userModelTypes';

type TeamSettings = {
    [key: string]: unknown;
};

/**
 * @see @datawrapper/orm/models/Team.js
 */
export class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
    declare id: CreationOptional<string>;

    declare name: string;
    declare settings: TeamSettings;

    declare getPublicSettings: () => TeamSettings;
    declare hasUser: (user: User) => Promise<boolean>;

    declare default_theme?: string;
}
