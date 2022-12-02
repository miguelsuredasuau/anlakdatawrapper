import User from '../User';
import Chart from '../Chart';

export const init = () => {
    Chart.belongsTo(User, { foreignKey: 'author_id' });
    User.hasMany(Chart, { foreignKey: 'author_id' });
};
