import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { User } from './userModelTypes';

/**
 * @see @datawrapper/orm/models/AccessToken.js
 */
export class AccessToken extends Model<
    InferAttributes<AccessToken>,
    InferCreationAttributes<AccessToken>
> {
    declare id: CreationOptional<number>;

    declare type: string;
    declare token: string;
    declare last_used_at: CreationOptional<Date>;
    declare data: CreationOptional<Record<string, unknown>>;

    declare user: CreationOptional<User>;
}
