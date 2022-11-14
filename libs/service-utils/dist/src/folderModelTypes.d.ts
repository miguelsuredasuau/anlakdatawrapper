import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { Team } from './teamModelTypes';
/**
 * @see @datawrapper/orm/models/Folder.js
 */
export declare class Folder extends Model<InferAttributes<Folder>, InferCreationAttributes<Folder>> {
    id: CreationOptional<string>;
    name: string;
    user_id?: CreationOptional<number>;
    org_id?: CreationOptional<string>;
    getTeam: () => Promise<Team>;
}
