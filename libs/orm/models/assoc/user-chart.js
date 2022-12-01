const User = require('../User');
const Chart = require('../Chart');

exports.init = () => {
    Chart.belongsTo(User, { foreignKey: 'author_id' });
    User.hasMany(Chart, { foreignKey: 'author_id' });
};
