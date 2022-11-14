import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { User } from './userModelTypes';
/**
 * @see @datawrapper/orm/models/AccessToken.js
 */
export declare class AccessToken extends Model<InferAttributes<AccessToken>, InferCreationAttributes<AccessToken>> {
    id: CreationOptional<number>;
    type: string;
    token: string;
    last_used_at: CreationOptional<Date>;
    data: CreationOptional<Record<string, unknown>>;
    user: CreationOptional<User>;
}
