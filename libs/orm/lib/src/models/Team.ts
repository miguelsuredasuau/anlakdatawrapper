import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('team')<typeof Team>();
export default exported;
export type TeamModel = InstanceType<typeof Team>;

import SQ, {
    ForeignKey,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from 'sequelize';
import merge from 'merge-deep';
import { omit } from 'lodash';
import { clone, pick } from 'underscore';
import type { ProductModel } from './Product';
import TeamProduct from './TeamProduct';
import Theme from './Theme';
import UserPluginCache from './UserPluginCache';
import UserProduct from './UserProduct';
import UserTeam, { type UserTeamModel } from './UserTeam';

/* make sure to keep in sync with services/php/lib/core/build/classes/datawrapper/Organization.php */
const defaultSettings = {
    folders: 'expanded',
    default: {
        folder: null as string | null,
        locale: null as string | null
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

class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
    declare id: string;
    declare name: string;
    declare settings: typeof defaultSettings;
    declare getProducts: HasManyGetAssociationsMixin<ProductModel>;
    declare user_team: NonAttribute<UserTeamModel>;
    declare default_theme: ForeignKey<string>;

    // TODO: figure out types without breaking TS with circular dependencies
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    declare getUsers: HasManyGetAssociationsMixin<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    declare hasUser: HasManyHasAssociationMixin<any, number>;

    static async countTeamAndOwnerProducts(teamId: string) {
        const teamOwner = await UserTeam.findOne({
            where: {
                organization_id: teamId,
                ['organization_role' as string as 'team_role']: 'owner'
            }
        });

        return Promise.all([
            TeamProduct.count({
                where: {
                    organization_id: teamId
                }
            }),
            teamOwner
                ? UserProduct.count({
                      where: {
                          user_id: teamOwner.user_id
                      }
                  })
                : Promise.resolve(0)
        ]);
    }

    async invalidatePluginCache() {
        const userTeams = await UserTeam.findAll({
            where: {
                organization_id: this.id
            }
        });

        const userQuery = {
            [SQ.Op.or]: userTeams.map(({ user_id }) => ({ user_id }))
        };

        await UserPluginCache.destroy({
            where: userQuery
        });
    }

    getPublicSettings() {
        return pick(this.settings, 'downloadDataLocalized');
    }

    serialize() {
        // delete non-safe properties
        return omit(this.toJSON(), 'settings');
    }
}

setInitializer(exported, ({ initOptions }) => {
    Team.init(
        {
            id: {
                type: SQ.STRING(128),
                primaryKey: true
            },

            name: SQ.STRING,
            settings: {
                type: SQ.JSON,
                get() {
                    const settings = this.getDataValue('settings') || {};
                    return merge(clone(defaultSettings), settings);
                }
            }
        },
        {
            tableName: 'organization',
            ...initOptions
        }
    );

    Team.belongsTo(Theme, { foreignKey: 'default_theme' });

    return Team;
});
