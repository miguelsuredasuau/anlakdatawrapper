declare const exported: import("../utils/wrap").ExportedLite<"team", typeof Team>;
export default exported;
export type TeamModel = InstanceType<typeof Team>;
import SQ, { ForeignKey, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
import type { ProductModel } from './Product';
import { type UserTeamModel } from './UserTeam';
declare const defaultSettings: {
    folders: string;
    default: {
        folder: string | null;
        locale: string | null;
    };
    webhook_url: string;
    webhook_enabled: boolean;
    slack_webhook_url: string;
    slack_enabled: boolean;
    msteams_webhook_url: string;
    msteams_enabled: boolean;
    ga_enabled: boolean;
    ga_id: string;
    downloadImageFormat: string;
    downloadFilenameTemplate: string;
    embed: {
        preferred_embed: string;
        custom_embed: {
            title: string;
            text: string;
            template: string;
        };
    };
    customFields: never[];
    sso: {
        enabled: boolean;
        protocol: string;
        automaticProvisioning: boolean;
        openId: {
            domain: string;
            clientId: string;
            clientSecret: string;
        };
        saml: {
            url: string;
            entityId: string;
            certificate: string;
            disableRequestedAuthnContext: boolean;
        };
    };
    disableVisualizations: {
        enabled: boolean;
        visualizations: {};
        allowAdmins: boolean;
    };
    pdfUpload: {
        ftp: {
            enabled: boolean;
            server: string;
            user: string;
            password: string;
            directory: string;
            filename: string;
        };
        s3: {
            enabled: boolean;
            bucket: string;
            region: string;
            accessKeyId: string;
            secret: string;
            prefix: string;
            filename: string;
        };
    };
    restrictDefaultThemes: boolean;
    css: string;
    flags: {};
    displayLocale: boolean;
    displayCustomField: {
        enabled: boolean;
        key: string;
    };
};
declare class Team extends Model<InferAttributes<Team>, InferCreationAttributes<Team>> {
    id: string;
    name: string;
    settings: typeof defaultSettings;
    getProducts: HasManyGetAssociationsMixin<ProductModel>;
    user_team: NonAttribute<UserTeamModel>;
    default_theme: ForeignKey<string>;
    getUsers: HasManyGetAssociationsMixin<any>;
    hasUser: HasManyHasAssociationMixin<any, number>;
    static countTeamAndOwnerProducts(teamId: string): Promise<[number, number]>;
    invalidatePluginCache(): Promise<void>;
    getPublicSettings(): Partial<{
        folders: string;
        default: {
            folder: string | null;
            locale: string | null;
        };
        webhook_url: string;
        webhook_enabled: boolean;
        slack_webhook_url: string;
        slack_enabled: boolean;
        msteams_webhook_url: string;
        msteams_enabled: boolean;
        ga_enabled: boolean;
        ga_id: string;
        downloadImageFormat: string;
        downloadFilenameTemplate: string;
        embed: {
            preferred_embed: string;
            custom_embed: {
                title: string;
                text: string;
                template: string;
            };
        };
        customFields: never[];
        sso: {
            enabled: boolean;
            protocol: string;
            automaticProvisioning: boolean;
            openId: {
                domain: string;
                clientId: string;
                clientSecret: string;
            };
            saml: {
                url: string;
                entityId: string;
                certificate: string;
                disableRequestedAuthnContext: boolean;
            };
        };
        disableVisualizations: {
            enabled: boolean;
            visualizations: {};
            allowAdmins: boolean;
        };
        pdfUpload: {
            ftp: {
                enabled: boolean;
                server: string;
                user: string;
                password: string;
                directory: string;
                filename: string;
            };
            s3: {
                enabled: boolean;
                bucket: string;
                region: string;
                accessKeyId: string;
                secret: string;
                prefix: string;
                filename: string;
            };
        };
        restrictDefaultThemes: boolean;
        css: string;
        flags: {};
        displayLocale: boolean;
        displayCustomField: {
            enabled: boolean;
            key: string;
        };
    }>;
    serialize(): Pick<SQ.InferAttributes<Team, {
        omit: never;
    }>, "id" | "name" | "default_theme">;
}
