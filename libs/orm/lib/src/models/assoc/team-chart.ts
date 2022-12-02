import Team from '../Team';
import Chart from '../Chart';

export const init = () => {
    Chart.belongsTo(Team, { foreignKey: 'organization_id' });
    Team.hasMany(Chart, { foreignKey: 'organization_id' });
};
