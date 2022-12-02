import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('theme')<typeof Theme>();
export default exported;
export type ThemeModel = InstanceType<typeof Theme>;

import assign from 'assign-deep';
import merge from 'merge-deep';
import SQ, { ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { indexBy } from 'underscore';
import type { Metadata as ChartMetadata } from '@datawrapper/shared/chartTypes';
import type { Theme as BasicThemeData } from '@datawrapper/shared/themeTypes';

const MAX_EXTEND_DEPTH = 10;

type Asset = Record<string, unknown> & { type: string };
type Assets = Record<string, Asset>;
type ThemeData = BasicThemeData & { metadata?: ChartMetadata };

class Theme extends Model<InferAttributes<Theme>, InferCreationAttributes<Theme>> {
    declare id: string;
    declare title: string;
    declare data: BasicThemeData;
    declare less: string;
    declare assets: Assets;
    declare extend: ForeignKey<string>;

    /*
     * retreive "merged" theme data, which is the theme data
     * with all data of "extended" themes merged into it.
     */
    async getMergedData() {
        // Mutable variable, we're starting with the current object and then go up
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let theme: Theme = this;
        const data = [theme.data];
        for (let i = 0; i < MAX_EXTEND_DEPTH; i++) {
            if (!theme.get('extend')) {
                break;
            }
            const parentTheme = await Theme.findByPk(theme.get('extend'));
            if (!parentTheme) {
                // This can happen on a production system that is missing the database constraint saying
                // that Theme.extend must point to an existing Theme.
                break;
            }
            theme = parentTheme;
            data.push(theme.data);
        }
        let merged: ThemeData = {};
        while (data.length) {
            merged = assign(merged, data.pop());
        }
        return merged;
    }

    /*
     * retreive "merged" theme assets, which is the theme assets
     * with all assets of "extended" themes merged into it.
     */
    async getMergedAssets(): Promise<Assets> {
        // Mutable variable, we're starting with the current object and then go up
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let theme: Theme = this;
        const assets = [theme.assets];
        while (theme.get('extend')) {
            const parentTheme = await Theme.findByPk(theme.get('extend'));
            if (!parentTheme) {
                // This can happen on a production system that is missing the database constraint saying
                // that Theme.extend must point to an existing Theme.
                break;
            }
            theme = parentTheme;
            if (theme.assets) assets.push(theme.assets);
        }
        let merged: Assets = {};
        while (assets.length) {
            merged = Object.assign(merged, assets.pop());
        }
        return merged;
    }

    /*
     * retreive "merged" theme less
     */
    async getMergedLess() {
        // Mutable variable, we're starting with the current object and then go up
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let theme: Theme = this;
        let less = theme.less || '';
        while (theme.get('extend')) {
            const parentTheme = await Theme.findByPk(theme.get('extend'));
            if (!parentTheme) {
                // This can happen on a production system that is missing the database constraint saying
                // that Theme.extend must point to an existing Theme.
                break;
            }
            theme = parentTheme;
            less = (theme.less || '') + '\n\n\n' + less;
        }
        return less;
    }

    addAssetFile(name: string, url: string) {
        return this.addAsset('file', name, { url });
    }

    addAssetFont(name: string, method: string, urls: Record<string, unknown>) {
        const data =
            method === 'import' ? { method, import: urls['import'] } : { method, files: urls };
        return this.addAsset('font', name, data);
    }

    addAsset(type: string, name: string, data: Record<string, unknown>) {
        if (!this.assets) this.assets = {};
        const assets = { ...this.assets };
        assets[name] = {
            type,
            ...data
        };
        this.set('assets', assets);
        return this.save({ fields: ['assets'] });
    }

    getAssetUrl(name: string) {
        return this.assets?.[name]?.['url'] ?? null;
    }

    async getAssets(type: string) {
        const assets = await this.getMergedAssets();
        return Object.entries(assets)
            .map(([name, value]): Asset & { name: string } => ({ ...value, name }))
            .filter(d => !type || d.type === type);
    }

    getAssetFiles() {
        return this.getAssets('file');
    }

    getAssetFonts() {
        return this.getAssets('font');
    }

    removeAsset(name: string) {
        if (!this.assets[name]) {
            return;
        }

        const assets = { ...this.assets };
        delete assets[name];
        this.set('assets', assets);
        return this.save({ fields: ['assets'] });
    }

    /**
     * in some scenarios it might not be efficient to query themes
     * with all their parent data individually as some themes would
     * get queried multiple times.
     * this implementation provides a single-query alternative by
     * loading all themes first and then using them to resolve the
     * theme data dependencies.
     */
    static async getAllMergedThemes() {
        const themes = await Theme.findAll();
        const themesById = indexBy(themes, 'id');
        return themes.map(originalTheme => {
            const data: unknown[] = [];
            const assets: Assets[] = [];
            const less: string[] = [];
            for (
                let theme: Theme | undefined = originalTheme;
                theme;
                theme = themesById[theme.extend]
            ) {
                data.push(merge({}, theme.data));
                if (theme.assets) assets.push(theme.assets);
                if (theme.less) less.push(theme.less);
            }

            let mergedData: ThemeData = {};
            while (data.length) {
                mergedData = assign(mergedData, data.pop());
            }

            let mergedAssets: Assets = {};
            while (assets.length) {
                mergedAssets = Object.assign(mergedAssets, assets.pop());
            }

            const resultTheme = originalTheme.toJSON();
            resultTheme.data = mergedData;
            resultTheme.assets = mergedAssets;
            resultTheme.less = less.reverse().join('\n\n');
            return resultTheme;
        });
    }
}

setInitializer(exported, ({ initOptions }) => {
    Theme.init(
        {
            id: {
                type: SQ.STRING(128),
                primaryKey: true
            },

            title: SQ.STRING(128),

            data: {
                type: SQ.JSON,
                allowNull: false
            },

            less: SQ.TEXT,

            assets: {
                type: SQ.JSON,
                allowNull: false
            }
        },
        {
            tableName: 'theme',
            ...initOptions
        }
    );

    Theme.belongsTo(Theme, { foreignKey: 'extend' });

    return Theme;
});
