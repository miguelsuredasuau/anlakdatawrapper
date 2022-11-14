import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

/**
 * @see @datawrapper/orm/models/Session.js
 */
export class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
    declare id: CreationOptional<string>;

    declare user_id: CreationOptional<string | null>;

    declare persistent: CreationOptional<boolean>;

    declare data: CreationOptional<Record<string, unknown>>;
}
