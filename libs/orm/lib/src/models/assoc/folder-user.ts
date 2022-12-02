import Folder from '../Folder';
import User from '../User';

export const init = () => {
    Folder.belongsTo(User, { foreignKey: 'user_id' });
    User.hasMany(Folder, { foreignKey: 'user_id' });
};
