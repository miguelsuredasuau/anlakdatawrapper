declare const exported: import("../utils/wrap").ExportedLite<"team", typeof Team>;
export default exported;
export type TeamModel = InstanceType<typeof Team>;
import SQ, { ForeignKey, HasManyGetAssociationsMixin, HasManyHasAssociationMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
import type { ProductModel } from './Product';
import { type UserTeamModel } from './UserTeam';
declare const defaultSettings: {
    readonly folders: "expanded" | "collapsed" | null | undefined;
    readonly default: {
        folder: number | null;
        locale: string | null;
    } | undefined;
    readonly webhook_url: string | undefined;
    readonly webhook_enabled: boolean | undefined;
    readonly slack_webhook_url: string | undefined;
    readonly slack_enabled: boolean | undefined;
    readonly msteams_webhook_url: string | undefined;
    readonly msteams_enabled: boolean | undefined;
    readonly ga_enabled: boolean | undefined;
    readonly ga_id: string | undefined;
    readonly downloadImageFormat: string | undefined;
    readonly downloadFilenameTemplate: string | undefined;
    readonly embed: {
        preferred_embed: string | undefined;
        custom_embed: {
            title: string;
            text: string;
            template: string;
        } | undefined;
    };
    readonly customFields: unknown[] | undefined;
    readonly sso: {
        enabled: boolean | undefined;
        protocol: string | undefined;
        automaticProvisioning: boolean | undefined;
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
        } | undefined;
    } | undefined;
    readonly disableVisualizations: {
        enabled: boolean;
        visualizations: never[] | Record<string, boolean>;
        allowAdmins: boolean;
    } | undefined;
    readonly pdfUpload: {
        ftp: {
            enabled: boolean;
            server: string;
            user: string;
            password: string;
            directory: string;
            filename: string;
        } | undefined;
        s3: {
            enabled: boolean;
            bucket: string;
            region: string;
            accessKeyId: string;
            secret: string;
            prefix: string;
            filename: string;
        } | undefined;
    } | undefined;
    readonly restrictDefaultThemes: boolean | undefined;
    readonly css: string | undefined;
    readonly flags: Record<string, boolean> | undefined;
    readonly displayLocale: boolean | undefined;
    readonly displayCustomField: {
        enabled: boolean;
        key: string;
    } | undefined;
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
        readonly folders: "expanded" | "collapsed" | null | undefined;
        readonly default: {
            folder: number | null;
            locale: string | null;
        } | undefined;
        readonly webhook_url: string | undefined;
        readonly webhook_enabled: boolean | undefined;
        readonly slack_webhook_url: string | undefined;
        readonly slack_enabled: boolean | undefined;
        readonly msteams_webhook_url: string | undefined;
        readonly msteams_enabled: boolean | undefined;
        readonly ga_enabled: boolean | undefined;
        readonly ga_id: string | undefined;
        readonly downloadImageFormat: string | undefined;
        readonly downloadFilenameTemplate: string | undefined;
        readonly embed: {
            preferred_embed: string | undefined;
            custom_embed: {
                title: string;
                text: string;
                template: string;
            } | undefined;
        };
        readonly customFields: unknown[] | undefined;
        readonly sso: {
            enabled: boolean | undefined;
            protocol: string | undefined;
            automaticProvisioning: boolean | undefined;
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
            } | undefined;
        } | undefined;
        readonly disableVisualizations: {
            enabled: boolean;
            visualizations: never[] | Record<string, boolean>;
            allowAdmins: boolean;
        } | undefined;
        readonly pdfUpload: {
            ftp: {
                enabled: boolean;
                server: string;
                user: string;
                password: string;
                directory: string;
                filename: string;
            } | undefined;
            s3: {
                enabled: boolean;
                bucket: string;
                region: string;
                accessKeyId: string;
                secret: string;
                prefix: string;
                filename: string;
            } | undefined;
        } | undefined;
        readonly restrictDefaultThemes: boolean | undefined;
        readonly css: string | undefined;
        readonly flags: Record<string, boolean> | undefined;
        readonly displayLocale: boolean | undefined;
        readonly displayCustomField: {
            enabled: boolean;
            key: string;
        } | undefined;
    }>;
    serialize(): Pick<SQ.InferAttributes<Team, {
        omit: never;
    }>, "id" | "name" | "default_theme">;
}
