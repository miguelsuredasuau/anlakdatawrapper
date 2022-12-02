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
const exported = (0, wrap_1.createExports)('user')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const underscore_1 = require("underscore");
const omit_1 = __importDefault(require("lodash/omit"));
const Plugin_1 = __importDefault(require("./Plugin"));
const Product_1 = __importDefault(require("./Product"));
const Team_1 = __importDefault(require("./Team"));
const UserData_1 = __importDefault(require("./UserData"));
const UserTeam_1 = __importDefault(require("./UserTeam"));
class User extends sequelize_1.Model {
    /*
     * use user.serialize() whenever user info is about
     * to get shared publicly, via API etc
     */
    serialize() {
        // delete non-safe properties
        return (0, omit_1.default)(this.toJSON(), 'pwd', 'deleted', 'created_at', 'reset_password_token', 'activate_token', 'customer_id');
    }
    /*
     * check if the user is a Datawrapper admin
     */
    isAdmin() {
        return this.role === 'admin' || this.role === 'sysadmin';
    }
    /*
     * check if the user has activated their account
     */
    isActivated() {
        return this.role !== 'pending' && this.role !== 'guest';
    }
    /*
     * check if the user is allowed to view and edit a chart
     */
    async mayEditChart(chart) {
        // the user is the author!
        if (this.id === chart.author_id)
            return true;
        // the user has admin privilegen
        if (this.role === 'admin' || this.role === 'sysadmin')
            return true;
        // the user is member of a team the chart belongs to
        return await this.hasActivatedTeam(chart.organization_id);
    }
    async hasActivatedTeam(teamId) {
        const team = await UserTeam_1.default.findOne({
            where: {
                user_id: this.id,
                organization_id: teamId
            }
        });
        if (!team)
            return false;
        if (team.invite_token && team.invite_token.length)
            return false;
        return true;
    }
    /*
     * check if the user is allowed to administrate a team
     */
    async mayAdministrateTeam(teamId) {
        if (this.role === 'admin' || this.role === 'sysadmin')
            return true;
        const team = await UserTeam_1.default.findOne({
            where: {
                user_id: this.id,
                organization_id: teamId
            }
        });
        if (!team)
            return false;
        if (team.dataValues.team_role === 2)
            return false;
        return true;
    }
    /*
     * get list of all products a user has access to
     * through UserProduct or TeamProducts
     */
    async getAllProducts() {
        const products = await this.getProducts();
        const teams = await this.getTeams();
        if (teams.length) {
            for (const team of teams) {
                const teamProducts = await team.getProducts();
                products.push(...teamProducts);
            }
        }
        return (0, underscore_1.uniq)(products).sort((a, b) => a.priority - b.priority);
    }
    /*
     * decides whether or not a user may use functions provided
     * by a certain plugin. intended to be used by the plugins
     *
     * @returns true|false
     */
    async mayUsePlugin(pluginId) {
        // check if the plugin is available for everyone
        const plugin = await Plugin_1.default.findOne({
            where: {
                id: pluginId,
                enabled: true
            }
        });
        if (!plugin) {
            // the plugin doesn't exist or is disabled
            return false;
        }
        if (!plugin.is_private) {
            // the plugin exists and is not set to private
            return true;
        }
        // finally if the user has access to the plugin
        const cachedUserPlugins = await this.getUserPluginCache();
        if (cachedUserPlugins) {
            const cachedPlugins = cachedUserPlugins.plugins
                ? cachedUserPlugins.plugins.split(',')
                : [];
            return cachedPlugins.includes(pluginId);
        }
        const userPlugins = await this.getPlugins();
        return userPlugins.filter(plugin => plugin.id === pluginId).length > 0;
    }
    /*
     * returns a list of all plugins a user has access to
     */
    async getPlugins() {
        const plugins = await Plugin_1.default.findAll();
        const hasAccess = [];
        for (const plugin of plugins) {
            if (plugin.enabled) {
                if (!plugin.is_private) {
                    hasAccess.push(plugin);
                }
                else {
                    // check if we gain access through one of the products
                    const products = await this.getAllProducts();
                    for (const product of products) {
                        const add = await product.hasPlugin(plugin.id);
                        if (add) {
                            hasAccess.push(plugin);
                            break;
                        }
                    }
                }
            }
        }
        return hasAccess;
    }
    /*
     * the "active" product is a concept from our old PHP implementation:
     * a given user can have multiple products attached, both via UserProdct
     * and via TeamProduct. Since these products define which features a user
     * can use, we have to "pick" a single product. To do so, we introduced
     * product.priority. In case a user has multile products, we pick the
     * one with the highest priority. If a user has no products at all,
     * we select the product with the lowest priority as default.
     */
    async getActiveProduct() {
        const teams = await this.getAcceptedTeams();
        // TODO: perhaps there is a way to do this in one
        // query (in raw SQL there is), but I'm not sure
        // how to do it in Sequelize
        const userProduct = await Product_1.default.findOne({
            where: {
                deleted: false
            },
            include: [
                {
                    model: User,
                    attributes: [],
                    required: true,
                    through: {
                        attributes: ['user_id'],
                        where: {
                            user_id: this.id
                        }
                    }
                }
            ],
            order: [['priority', 'DESC']]
        });
        const teamProduct = await Product_1.default.findOne({
            where: {
                deleted: false
            },
            include: [
                {
                    model: Team_1.default,
                    attributes: [],
                    required: true,
                    through: {
                        attributes: ['organization_id'],
                        where: {
                            organization_id: teams.map(t => t.id)
                        }
                    }
                }
            ],
            order: [['priority', 'DESC']]
        });
        if (!teamProduct && !userProduct) {
            // return product with lowest priority as default fallback
            // if a user has no products
            return Product_1.default.findOne({
                where: {
                    deleted: false
                },
                order: [['priority', 'ASC']]
            });
        }
        if (teamProduct && userProduct) {
            // return product with highest priority
            return teamProduct.priority > userProduct.priority ? teamProduct : userProduct;
        }
        return teamProduct ? teamProduct : userProduct;
    }
    /*
     * returns all teams for the current user where the invitation was accepted
     */
    async getAcceptedTeams() {
        const teams = await this.getTeams();
        return teams.filter(t => t.user_team.getDataValue('invite_token') === '');
    }
    /*
     * returns the currently active team, or null if it doesn't exist
     */
    async getActiveTeam(session) {
        const teams = await this.getAcceptedTeams();
        if (teams.length < 1)
            return null;
        let activeTeam = await UserData_1.default.getUserData(this.id, 'active_team');
        if (!activeTeam && session) {
            activeTeam = session.data['dw-user-organization'];
        }
        if (activeTeam === '%none%')
            return null;
        for (const team of teams) {
            if (team.id === activeTeam) {
                return team;
            }
        }
        return teams[0];
    }
    async getActiveTeamIds() {
        const activeUserTeams = await UserTeam_1.default.findAll({
            attributes: ['organization_id'],
            where: {
                user_id: this.id,
                invite_token: ''
            }
        });
        return activeUserTeams.map(userTeam => userTeam.organization_id);
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    const roleValues = ['admin', 'editor', 'pending', 'guest', 'sysadmin', 'graphic-editor'];
    User.init({
        id: {
            type: sequelize_1.default.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: { type: sequelize_1.default.STRING, allowNull: false },
        pwd: { type: sequelize_1.default.STRING, allowNull: false },
        activate_token: sequelize_1.default.STRING,
        reset_password_token: sequelize_1.default.STRING,
        role: {
            type: sequelize_1.default.INTEGER,
            values: roleValues,
            allowNull: false,
            defaultValue: 2,
            get() {
                const role = this.getDataValue('role');
                return roleValues[role];
            },
            set(val) {
                if (typeof val === 'string') {
                    const index = roleValues.indexOf(val);
                    if (index > -1)
                        this.setDataValue('role', index);
                }
            }
        },
        deleted: sequelize_1.default.BOOLEAN,
        language: { type: sequelize_1.default.STRING(5), defaultValue: 'en-US' },
        created_at: sequelize_1.default.DATE,
        // extended user profiles
        name: sequelize_1.default.STRING,
        website: sequelize_1.default.STRING,
        sm_profile: sequelize_1.default.STRING,
        oauth_signin: sequelize_1.default.STRING,
        customer_id: sequelize_1.default.STRING
    }, {
        tableName: 'user',
        ...initOptions
    });
    return User;
});
