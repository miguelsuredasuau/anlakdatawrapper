import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('user_product')<typeof UserProduct>();
export default exported;

import SQ, {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import User from './User';
import Product from './Product';

class UserProduct extends Model<
    InferAttributes<UserProduct>,
    InferCreationAttributes<UserProduct>
> {
    // The code uses `userId` and `user_id` interchangeably,
    // so we have to maintain two model fields here
    // (Sequelize implementation allows both names to be used).
    // However, we have to mark at least one of them as nullable,
    // otherwise Sequelize types would require us to specify both
    // when creating a new entry.
    declare userId: ForeignKey<number>;
    declare user_id: ForeignKey<number> | null;

    // See comment for userId / user_id
    declare productId: ForeignKey<number>;
    declare product_id: ForeignKey<number> | null;

    declare created_by_admin: CreationOptional<boolean>;
    declare changes: string | undefined;
    declare expires: Date | undefined;
}

setInitializer(exported, ({ initOptions }) => {
    UserProduct.init(
        {
            user_id: SQ.INTEGER,
            product_id: SQ.INTEGER,
            created_by_admin: {
                type: SQ.BOOLEAN,
                defaultValue: true
            },

            changes: SQ.TEXT,

            expires: SQ.DATE
        },
        {
            tableName: 'user_product',
            timestamps: false,
            ...initOptions
        }
    );

    User.belongsToMany(Product, {
        through: UserProduct,
        timestamps: false
    });

    Product.belongsToMany(User, {
        through: UserProduct,
        timestamps: false
    });

    return UserProduct;
});
