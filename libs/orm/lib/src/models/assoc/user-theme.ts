import User from '../User';
import Theme from '../Theme';

export const init = () => {
    User.belongsToMany(Theme, {
        through: 'user_theme',
        timestamps: false
    });

    Theme.belongsToMany(User, {
        through: 'user_theme',
        timestamps: false
    });
};
