import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import type { Theme as ThemeMetadata } from '@datawrapper/shared/themeTypes';
declare type ThemeData = {
    metadata: ThemeMetadata;
};
/**
 * @see @datawrapper/orm/models/Theme.js
 */
export declare class Theme extends Model<InferAttributes<Theme>, InferCreationAttributes<Theme>> {
    id: CreationOptional<number>;
    title: string;
    data: ThemeData;
    less: CreationOptional<string>;
    assets: CreationOptional<unknown>;
    getMergedData: () => Promise<ThemeData>;
}
export {};
