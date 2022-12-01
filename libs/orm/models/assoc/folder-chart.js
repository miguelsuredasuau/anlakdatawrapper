const Folder = require('../Folder');
const Chart = require('../Chart');

exports.init = () => {
    Chart.belongsTo(Folder, { foreignKey: 'in_folder' });
    Folder.hasMany(Chart, { foreignKey: 'in_folder' });
};
