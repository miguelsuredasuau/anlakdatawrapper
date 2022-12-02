"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('theme')();
exports.default = exported;
const assign_deep_1 = __importDefault(require("assign-deep"));
const merge_deep_1 = __importDefault(require("merge-deep"));
const sequelize_1 = __importStar(require("sequelize"));
const underscore_1 = require("underscore");
const MAX_EXTEND_DEPTH = 10;
class Theme extends sequelize_1.Model {
    /*
     * retreive "merged" theme data, which is the theme data
     * with all data of "extended" themes merged into it.
     */
    async getMergedData() {
        // Mutable variable, we're starting with the current object and then go up
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let theme = this;
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
        let merged = {};
        while (data.length) {
            merged = (0, assign_deep_1.default)(merged, data.pop());
        }
        return merged;
    }
    /*
     * retreive "merged" theme assets, which is the theme assets
     * with all assets of "extended" themes merged into it.
     */
    async getMergedAssets() {
        // Mutable variable, we're starting with the current object and then go up
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let theme = this;
        const assets = [theme.assets];
        while (theme.get('extend')) {
            const parentTheme = await Theme.findByPk(theme.get('extend'));
            if (!parentTheme) {
                // This can happen on a production system that is missing the database constraint saying
                // that Theme.extend must point to an existing Theme.
                break;
            }
            theme = parentTheme;
            if (theme.assets)
                assets.push(theme.assets);
        }
        let merged = {};
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
        let theme = this;
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
    addAssetFile(name, url) {
        return this.addAsset('file', name, { url });
    }
    addAssetFont(name, method, urls) {
        const data = method === 'import' ? { method, import: urls['import'] } : { method, files: urls };
        return this.addAsset('font', name, data);
    }
    addAsset(type, name, data) {
        if (!this.assets)
            this.assets = {};
        const assets = { ...this.assets };
        assets[name] = {
            type,
            ...data
        };
        this.set('assets', assets);
        return this.save({ fields: ['assets'] });
    }
    getAssetUrl(name) {
        return this.assets?.[name]?.['url'] ?? null;
    }
    async getAssets(type) {
        const assets = await this.getMergedAssets();
        return Object.entries(assets)
            .map(([name, value]) => ({ ...value, name }))
            .filter(d => !type || d.type === type);
    }
    getAssetFiles() {
        return this.getAssets('file');
    }
    getAssetFonts() {
        return this.getAssets('font');
    }
    removeAsset(name) {
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
        const themesById = (0, underscore_1.indexBy)(themes, 'id');
        return themes.map(originalTheme => {
            const data = [];
            const assets = [];
            const less = [];
            for (let theme = originalTheme; theme; theme = themesById[theme.extend]) {
                data.push((0, merge_deep_1.default)({}, theme.data));
                if (theme.assets)
                    assets.push(theme.assets);
                if (theme.less)
                    less.push(theme.less);
            }
            let mergedData = {};
            while (data.length) {
                mergedData = (0, assign_deep_1.default)(mergedData, data.pop());
            }
            let mergedAssets = {};
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
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    Theme.init({
        id: {
            type: sequelize_1.default.STRING(128),
            primaryKey: true
        },
        title: sequelize_1.default.STRING(128),
        data: {
            type: sequelize_1.default.JSON,
            allowNull: false
        },
        less: sequelize_1.default.TEXT,
        assets: {
            type: sequelize_1.default.JSON,
            allowNull: false
        }
    }, {
        tableName: 'theme',
        ...initOptions
    });
    Theme.belongsTo(Theme, { foreignKey: 'extend' });
    return Theme;
});
