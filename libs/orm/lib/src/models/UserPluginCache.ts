import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('user_plugin_cache')<typeof UserPluginCache>();
export default exported;
export type UserPluginCacheModel = InstanceType<typeof UserPluginCache>;

import SQ, { ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import User from './User';

class UserPluginCache extends Model<
    InferAttributes<UserPluginCache>,
    InferCreationAttributes<UserPluginCache>
> {
    declare user_id: ForeignKey<number>;
    declare plugins: string;
}

setInitializer(exported, ({ initOptions }) => {
    UserPluginCache.init(
        {
            user_id: {
                type: SQ.INTEGER,
                primaryKey: true
            },
            plugins: SQ.TEXT
        },
        {
            tableName: 'user_plugin_cache',
            timestamps: false,
            ...initOptions
        }
    );

    UserPluginCache.belongsTo(User);
    User.hasOne(UserPluginCache, {
        as: 'UserPluginCache',
        foreignKey: 'user_id'
    });

    return UserPluginCache;
});
