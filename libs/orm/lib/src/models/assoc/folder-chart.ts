import Folder from '../Folder';
import Chart from '../Chart';

export const init = () => {
    Chart.belongsTo(Folder, { foreignKey: 'in_folder' });
    Folder.hasMany(Chart, { foreignKey: 'in_folder' });
};
