import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { Theme as ThemeMetadata } from '@datawrapper/shared/themeTypes';

type ThemeData = {
    metadata: ThemeMetadata;
};

/**
 * @see @datawrapper/orm/models/Theme.js
 */
export class Theme extends Model<InferAttributes<Theme>, InferCreationAttributes<Theme>> {
    declare id: CreationOptional<number>;

    declare title: string;
    declare data: ThemeData;

    declare less: CreationOptional<string>;
    declare assets: CreationOptional<unknown>; // TODO Describe theme assets.

    declare getMergedData: () => Promise<ThemeData>;
}
