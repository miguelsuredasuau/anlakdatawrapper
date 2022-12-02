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
const exported = (0, wrap_1.createExports)('team')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const merge_deep_1 = __importDefault(require("merge-deep"));
const lodash_1 = require("lodash");
const underscore_1 = require("underscore");
const TeamProduct_1 = __importDefault(require("./TeamProduct"));
const Theme_1 = __importDefault(require("./Theme"));
const UserPluginCache_1 = __importDefault(require("./UserPluginCache"));
const UserProduct_1 = __importDefault(require("./UserProduct"));
const UserTeam_1 = __importDefault(require("./UserTeam"));
/* make sure to keep in sync with services/php/lib/core/build/classes/datawrapper/Organization.php */
const defaultSettings = {
    folders: 'expanded',
    default: {
        folder: null,
        locale: null
    },
    webhook_url: '',
    webhook_enabled: false,
    slack_webhook_url: '',
    slack_enabled: false,
    msteams_webhook_url: '',
    msteams_enabled: false,
    ga_enabled: false,
    ga_id: '',
    downloadImageFormat: 'full',
    downloadFilenameTemplate: '{{ LOWER(title) }}',
    embed: {
        preferred_embed: 'responsive',
        custom_embed: {
            title: '',
            text: '',
            template: ''
        }
    },
    customFields: [],
    sso: {
        enabled: false,
        protocol: 'openId',
        automaticProvisioning: true,
        openId: {
            domain: '',
            clientId: '',
            clientSecret: ''
        },
        saml: {
            url: '',
            entityId: '',
            certificate: '',
            disableRequestedAuthnContext: false
        }
    },
    disableVisualizations: {
        enabled: false,
        visualizations: {},
        allowAdmins: false
    },
    pdfUpload: {
        ftp: {
            enabled: false,
            server: '',
            user: '',
            password: '',
            directory: '',
            filename: ''
        },
        s3: {
            enabled: false,
            bucket: '',
            region: '',
            accessKeyId: '',
            secret: '',
            prefix: '',
            filename: ''
        }
    },
    restrictDefaultThemes: false,
    css: '',
    // Note that these flags do not include the default feature flags
    // which are set during server initialization and can also be
    // defined by plugins
    flags: {},
    displayLocale: false,
    displayCustomField: {
        enabled: false,
        key: ''
    }
};
class Team extends sequelize_1.Model {
    static async countTeamAndOwnerProducts(teamId) {
        const teamOwner = await UserTeam_1.default.findOne({
            where: {
                organization_id: teamId,
                ['organization_role']: 'owner'
            }
        });
        return Promise.all([
            TeamProduct_1.default.count({
                where: {
                    organization_id: teamId
                }
            }),
            teamOwner
                ? UserProduct_1.default.count({
                    where: {
                        user_id: teamOwner.user_id
                    }
                })
                : Promise.resolve(0)
        ]);
    }
    async invalidatePluginCache() {
        const userTeams = await UserTeam_1.default.findAll({
            where: {
                organization_id: this.id
            }
        });
        const userQuery = {
            [sequelize_1.default.Op.or]: userTeams.map(({ user_id }) => ({ user_id }))
        };
        await UserPluginCache_1.default.destroy({
            where: userQuery
        });
    }
    getPublicSettings() {
        return (0, underscore_1.pick)(this.settings, 'downloadDataLocalized');
    }
    serialize() {
        // delete non-safe properties
        return (0, lodash_1.omit)(this.toJSON(), 'settings');
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    Team.init({
        id: {
            type: sequelize_1.default.STRING(128),
            primaryKey: true
        },
        name: sequelize_1.default.STRING,
        settings: {
            type: sequelize_1.default.JSON,
            get() {
                const settings = this.getDataValue('settings') || {};
                return (0, merge_deep_1.default)((0, underscore_1.clone)(defaultSettings), settings);
            }
        }
    }, {
        tableName: 'organization',
        ...initOptions
    });
    Team.belongsTo(Theme_1.default, { foreignKey: 'default_theme' });
    return Team;
});
