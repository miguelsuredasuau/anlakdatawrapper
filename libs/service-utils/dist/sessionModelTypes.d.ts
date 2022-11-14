import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
/**
 * @see @datawrapper/orm/models/Session.js
 */
export declare class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
    id: CreationOptional<string>;
    user_id: CreationOptional<string | null>;
    persistent: CreationOptional<boolean>;
    data: CreationOptional<Record<string, unknown>>;
}
