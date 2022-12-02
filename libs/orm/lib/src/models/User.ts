import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('user')<typeof User>();
export default exported;
export type UserModel = InstanceType<typeof User>;

import SQ, {
    CreationOptional,
    HasManyGetAssociationsMixin,
    HasOneGetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from 'sequelize';
import { uniq } from 'underscore';
import omit from 'lodash/omit';
import type { ChartModel } from './Chart';
import type { FolderModel } from './Folder';
import Plugin, { type PluginModel } from './Plugin';
import Product, { type ProductModel } from './Product';
import type { SessionModel } from './Session';
import Team, { type TeamModel } from './Team';
import type { ThemeModel } from './Theme';
import UserData, { type UserDataModel } from './UserData';
import type { UserPluginCacheModel } from './UserPluginCache';
import UserTeam from './UserTeam';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare email: string | null;
    declare pwd: string | null;
    declare activate_token: string | null;
    declare reset_password_token: string | null;
    declare role: 'admin' | 'editor' | 'pending' | 'guest' | 'sysadmin' | 'graphic-editor';
    declare deleted: boolean | null;
    declare language: string;
    declare created_at: CreationOptional<Date>;
    declare name: string | null;
    declare website: string | null;
    declare sm_profile: string | null;
    declare oauth_signin: string | null;
    declare customer_id: string | null;
    declare getProducts: HasManyGetAssociationsMixin<ProductModel>;
    declare getTeams: HasManyGetAssociationsMixin<TeamModel>;
    declare getUserPluginCache: HasOneGetAssociationMixin<UserPluginCacheModel>;
    declare getFolders: HasManyGetAssociationsMixin<FolderModel>;
    declare getThemes: HasManyGetAssociationsMixin<ThemeModel>;
    declare getUserData: HasOneGetAssociationMixin<UserDataModel>;
    declare teams?: NonAttribute<TeamModel[]>;

    // TODO: figure out types without breaking TS with circular dependencies
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    declare getCharts: HasManyGetAssociationsMixin<any>;

    /*
     * use user.serialize() whenever user info is about
     * to get shared publicly, via API etc
     */
    serialize() {
        // delete non-safe properties
        return omit(
            this.toJSON(),
            'pwd',
            'deleted',
            'created_at',
            'reset_password_token',
            'activate_token',
            'customer_id'
        );
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
    async mayEditChart(chart: ChartModel) {
        // the user is the author!
        if (this.id === chart.author_id) return true;
        // the user has admin privilegen
        if (this.role === 'admin' || this.role === 'sysadmin') return true;
        // the user is member of a team the chart belongs to
        return !!chart.organization_id && (await this.hasActivatedTeam(chart.organization_id));
    }

    async hasActivatedTeam(teamId: string) {
        const team = await UserTeam.findOne({
            where: {
                user_id: this.id,
                organization_id: teamId
            }
        });

        if (!team) return false;
        if (team.invite_token && team.invite_token.length) return false;

        return true;
    }

    /*
     * check if the user is allowed to administrate a team
     */
    async mayAdministrateTeam(teamId: string) {
        if (this.role === 'admin' || this.role === 'sysadmin') return true;

        const team = await UserTeam.findOne({
            where: {
                user_id: this.id,
                organization_id: teamId
            }
        });

        if (!team) return false;
        // Sequelize v6 types do not support model field and DB field having different types https://github.com/sequelize/sequelize/issues/13522
        // so we shouldn't use dataValues anywhere, and this line would be
        // `if (team.team_role === 'member') return false`,
        // but this change might have unintended consequences.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (team.dataValues.team_role === (2 as any)) return false;

        return true;
    }

    /*
     * get list of all products a user has access to
     * through UserProduct or TeamProducts
     */
    async getAllProducts(): Promise<ProductModel[]> {
        const products = await this.getProducts();
        const teams = await this.getTeams();
        if (teams.length) {
            for (const team of teams) {
                const teamProducts = await team.getProducts();
                products.push(...teamProducts);
            }
        }
        return uniq(products).sort((a, b) => a.priority - b.priority);
    }

    /*
     * decides whether or not a user may use functions provided
     * by a certain plugin. intended to be used by the plugins
     *
     * @returns true|false
     */
    async mayUsePlugin(pluginId: string) {
        // check if the plugin is available for everyone
        const plugin = await Plugin.findOne({
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
    async getPlugins(): Promise<PluginModel[]> {
        const plugins = await Plugin.findAll();
        const hasAccess: PluginModel[] = [];
        for (const plugin of plugins) {
            if (plugin.enabled) {
                if (!plugin.is_private) {
                    hasAccess.push(plugin);
                } else {
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
    async getActiveProduct(): Promise<ProductModel | null> {
        const teams = await this.getAcceptedTeams();

        // TODO: perhaps there is a way to do this in one
        // query (in raw SQL there is), but I'm not sure
        // how to do it in Sequelize
        const userProduct = await Product.findOne({
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
        const teamProduct = await Product.findOne({
            where: {
                deleted: false
            },
            include: [
                {
                    model: Team,
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
            return Product.findOne({
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
    async getAcceptedTeams(): Promise<TeamModel[]> {
        const teams = await this.getTeams();
        return teams.filter(t => t.user_team.getDataValue('invite_token') === '');
    }

    /*
     * returns the currently active team, or null if it doesn't exist
     */
    async getActiveTeam(session?: SessionModel | null): Promise<TeamModel | null | undefined> {
        const teams = await this.getAcceptedTeams();
        if (teams.length < 1) return null;

        let activeTeam = await UserData.getUserData(this.id, 'active_team');

        if (!activeTeam && session) {
            activeTeam = session.data['dw-user-organization'] as string;
        }

        if (activeTeam === '%none%') return null;

        for (const team of teams) {
            if (team.id === activeTeam) {
                return team;
            }
        }

        return teams[0];
    }

    async getActiveTeamIds(): Promise<string[]> {
        const activeUserTeams = await UserTeam.findAll({
            attributes: ['organization_id'],
            where: {
                user_id: this.id,
                invite_token: ''
            }
        });
        return activeUserTeams.map(userTeam => userTeam.organization_id);
    }
}

setInitializer(exported, ({ initOptions }) => {
    const roleValues = ['admin', 'editor', 'pending', 'guest', 'sysadmin', 'graphic-editor'];
    User.init(
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            email: { type: SQ.STRING, allowNull: false },
            pwd: { type: SQ.STRING, allowNull: false },

            activate_token: SQ.STRING,
            reset_password_token: SQ.STRING,

            role: {
                type: SQ.INTEGER,
                values: roleValues,
                allowNull: false,
                defaultValue: 2, // pending
                get() {
                    // Sequelize v6 types do not support model field and DB field having different types https://github.com/sequelize/sequelize/issues/13522
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const role: number = this.getDataValue('role') as any;
                    return roleValues[role];
                },
                set(val) {
                    if (typeof val === 'string') {
                        const index = roleValues.indexOf(val);
                        // Sequelize v6 types do not support model field and DB field having different types https://github.com/sequelize/sequelize/issues/13522
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if (index > -1) this.setDataValue('role', index as any);
                    }
                }
            },

            deleted: SQ.BOOLEAN,
            language: { type: SQ.STRING(5), defaultValue: 'en-US' },
            created_at: SQ.DATE,

            // extended user profiles
            name: SQ.STRING,
            website: SQ.STRING,
            sm_profile: SQ.STRING, // social media
            oauth_signin: SQ.STRING,
            customer_id: SQ.STRING
        },
        {
            tableName: 'user',
            ...initOptions
        }
    );

    return User;
});
