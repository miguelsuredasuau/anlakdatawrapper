const SQ = require('sequelize');
const { db } = require('../index');

const Team = db.define(
    'team',
    {
        id: {
            type: SQ.STRING(128),
            primaryKey: true
        },

        name: SQ.STRING,
        settings: SQ.JSON
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
