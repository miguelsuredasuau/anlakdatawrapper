const SQ = require('sequelize');
const { db } = require('../index');
const merge = require('merge-deep');
const { clone } = require('underscore');

/* make sure to keep in sync with services/php/lib/core/build/conf/datawrapper/Organization.php */
const defaultSettings = {
    folders: 'expanded',
    default: {
        folder: null,
        locale: null
    },
    slack_webhook_url: '',
    slack_enabled: false,
    msteams_webhook_url: '',
    msteams_enabled: false,
    ga_enabled: false,
    ga_id: '',
    downloadImageFormat: 'full',
    embed: {
        preferred_embed: 'responsive',
        custom_embed: {
            title: '',
            text: '',
            template: ''
        }
    },
    customFields: {},
    sso: {
        openId: {
            domain: '',
            clientId: '',
            clientSecret: ''
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
    flags: {}
};

const Team = db.define(
    'team',
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
        tableName: 'organization'
    }
);

Team.countTeamAndOwnerProducts = async function (teamId) {
    const TeamProduct = require('./TeamProduct');
    const UserProduct = require('./UserProduct');
    const UserTeam = require('./UserTeam');

    const teamOwner = await UserTeam.findOne({
        where: {
            organization_id: teamId,
            organization_role: 'owner'
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
};

Team.prototype.invalidatePluginCache = async function () {
    const UserTeam = require('./UserTeam');
    const UserPluginCache = require('./UserPluginCache');

    const userTeams = await UserTeam.findAll({
        where: {
            organization_id: this.id
        }
    });

    const userQuery = { [SQ.Op.or]: [] };

    for (const userTeam of userTeams) {
        userQuery[SQ.Op.or].push({
            user_id: userTeam.user_id
        });
    }

    await UserPluginCache.destroy({
        where: userQuery
    });
};

const Theme = require('./Theme');
Team.belongsTo(Theme, { foreignKey: 'default_theme' });

Team.prototype.serialize = function () {
    const d = this.toJSON();
    // delete non-safe properties
    delete d.settings;
    return d;
};

module.exports = Team;
