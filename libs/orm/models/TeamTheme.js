const { createExports } = require('../utils/wrap');
module.exports = createExports();

const Team = require('./Team');
const Theme = require('./Theme');

module.exports.dwORM$setInitializer(({ db }) => {
    const TeamTheme = db.define(
        'team_theme',
        {},
        {
            tableName: 'organization_theme',
            timestamps: false
        }
    );

    Team.belongsToMany(Theme, {
        through: TeamTheme,
        foreignKey: 'organization_id',
        timestamps: false
    });

    Theme.belongsToMany(Team, {
        through: TeamTheme,
        foreignKey: 'theme_id',
        timestamps: false
    });

    return TeamTheme;
});
