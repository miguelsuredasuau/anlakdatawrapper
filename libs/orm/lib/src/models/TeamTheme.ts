import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('team_theme')<typeof TeamTheme>();
export default exported;

import { InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import Team from './Team';
import Theme from './Theme';

class TeamTheme extends Model<InferAttributes<TeamTheme>, InferCreationAttributes<TeamTheme>> {}

setInitializer(exported, ({ initOptions }) => {
    TeamTheme.init(
        {},
        {
            tableName: 'organization_theme',
            timestamps: false,
            ...initOptions
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
