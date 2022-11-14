import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { Team } from './teamModelTypes';

/**
 * @see @datawrapper/orm/models/Folder.js
 */
export class Folder extends Model<InferAttributes<Folder>, InferCreationAttributes<Folder>> {
    declare id: CreationOptional<string>;
    declare name: string;

    declare user_id?: CreationOptional<number>;
    declare org_id?: CreationOptional<string>;
    declare getTeam: () => Promise<Team>;
}
