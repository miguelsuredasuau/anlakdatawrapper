const Team = require('../Team');
const Chart = require('../Chart');

exports.init = () => {
    Chart.belongsTo(Team, { foreignKey: 'organization_id' });
    Team.hasMany(Chart, { foreignKey: 'organization_id' });
};
