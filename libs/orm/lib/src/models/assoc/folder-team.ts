import Folder from '../Folder';
import Team from '../Team';

export const init = () => {
    Folder.belongsTo(Team, { foreignKey: 'org_id' });
    Team.hasMany(Folder, { foreignKey: 'org_id' });
};
