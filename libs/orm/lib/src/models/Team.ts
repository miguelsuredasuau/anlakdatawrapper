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

const required = <T, TRest extends any[]>(defaultValue: T, ..._rest: TRest): T | TRest[number] =>
    defaultValue;
const optional = <T, TRest extends any[]>(
    defaultValue: T,
    ..._rest: TRest
): T | TRest[number] | undefined => defaultValue;

const number = <number>0;
const string = <string>'';
const boolean = <boolean>false;

/* make sure to keep in sync with services/php/lib/core/build/classes/datawrapper/Organization.php */
const defaultSettings = {
    folders: optional('expanded', 'collapsed' as const, null),
    default: optional({
        folder: required(null, number),
        locale: required(null, string)
    }),
    webhook_url: optional('', string),
    webhook_enabled: optional(false, boolean),
    slack_webhook_url: optional('', string),
    slack_enabled: optional(false, boolean),
    msteams_webhook_url: optional('', string),
    msteams_enabled: optional(false, boolean),
    ga_enabled: optional(false, boolean),
    ga_id: optional('', string),
    downloadImageFormat: optional('full', string),
    downloadFilenameTemplate: optional('{{ LOWER(title) }}', string),
    embed: required({
        preferred_embed: optional('responsive', 'iframe', 'responsive-iframe', 'custom'),
        custom_embed: optional({
            title: required('', string),
            text: required('', string),
            template: required('', string)
        })
    }),
    customFields: optional(<unknown[]>[]),
    sso: optional({
        enabled: optional(false, boolean),
        protocol: optional('openId', 'saml', ''),
        automaticProvisioning: optional(true, boolean),
        openId: required({
            domain: required('', string),
            clientId: required('', string),
            clientSecret: required('', string)
        }),
        saml: optional({
            url: required('', string),
            entityId: required('', string),
            certificate: required('', string),
            disableRequestedAuthnContext: required(false, boolean)
        })
    }),
    disableVisualizations: optional({
        enabled: required(false, boolean),
        visualizations: required(<Record<string, boolean>>{}, []),
        allowAdmins: required(false, boolean)
    }),
    pdfUpload: optional({
        ftp: optional({
            enabled: required(false, boolean),
            server: required('', string),
            user: required('', string),
            password: required('', string),
            directory: required('', string),
            filename: required('', string)
        }),
        s3: optional({
            enabled: required(false, boolean),
            bucket: required('', string),
            region: required('', string),
            accessKeyId: required('', string),
            secret: required('', string),
            prefix: required('', string),
            filename: required('', string)
        })
    }),
    restrictDefaultThemes: optional(false, boolean),
    css: optional('', string),
    // Note that these flags do not include the default feature flags
    // which are set during server initialization and can also be
    // defined by plugins
    flags: optional(<Record<string, boolean>>{}),
    displayLocale: optional(false, boolean),
    displayCustomField: optional({
        enabled: required(false, boolean),
        key: required('', string)
    })
} as const;

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
