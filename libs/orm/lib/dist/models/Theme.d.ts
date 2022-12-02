declare const exported: import("../utils/wrap").ExportedLite<"theme", typeof Theme>;
export default exported;
export type ThemeModel = InstanceType<typeof Theme>;
import SQ, { ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import type { Metadata as ChartMetadata } from '@datawrapper/shared/chartTypes';
import type { Theme as BasicThemeData } from '@datawrapper/shared/themeTypes';
type Asset = Record<string, unknown> & {
    type: string;
};
type Assets = Record<string, Asset>;
type ThemeData = BasicThemeData & {
    metadata?: ChartMetadata;
};
declare class Theme extends Model<InferAttributes<Theme>, InferCreationAttributes<Theme>> {
    id: string;
    title: string;
    data: BasicThemeData;
    less: string;
    assets: Assets;
    extend: ForeignKey<string>;
    getMergedData(): Promise<ThemeData>;
    getMergedAssets(): Promise<Assets>;
    getMergedLess(): Promise<string>;
    addAssetFile(name: string, url: string): Promise<this>;
    addAssetFont(name: string, method: string, urls: Record<string, unknown>): Promise<this>;
    addAsset(type: string, name: string, data: Record<string, unknown>): Promise<this>;
    getAssetUrl(name: string): {} | null;
    getAssets(type: string): Promise<(Record<string, unknown> & {
        type: string;
    } & {
        name: string;
    })[]>;
    getAssetFiles(): Promise<(Record<string, unknown> & {
        type: string;
    } & {
        name: string;
    })[]>;
    getAssetFonts(): Promise<(Record<string, unknown> & {
        type: string;
    } & {
        name: string;
    })[]>;
    removeAsset(name: string): Promise<this> | undefined;
    /**
     * in some scenarios it might not be efficient to query themes
     * with all their parent data individually as some themes would
     * get queried multiple times.
     * this implementation provides a single-query alternative by
     * loading all themes first and then using them to resolve the
     * theme data dependencies.
     */
    static getAllMergedThemes(): Promise<SQ.InferAttributes<Theme, {
        omit: never;
    }>[]>;
}
