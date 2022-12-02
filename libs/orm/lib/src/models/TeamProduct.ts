import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('team_product')<typeof TeamProduct>();
export default exported;

import SQ, {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import Team from './Team';
import Product from './Product';

class TeamProduct extends Model<
    InferAttributes<TeamProduct>,
    InferCreationAttributes<TeamProduct>
> {
    declare created_by_admin: CreationOptional<boolean>;
    declare changes: string | undefined;
    declare expires: Date | undefined;
    declare organization_id: ForeignKey<string>;
    declare productId: ForeignKey<number>;
}

setInitializer(exported, ({ initOptions }) => {
    TeamProduct.init(
        {
            created_by_admin: {
                type: SQ.BOOLEAN,
                defaultValue: true
            },

            changes: SQ.TEXT,

            expires: SQ.DATE
        },
        {
            tableName: 'organization_product',
            timestamps: false,
            ...initOptions
        }
    );

    Team.belongsToMany(Product, {
        through: TeamProduct,
        foreignKey: 'organization_id',
        timestamps: false
    });

    Product.belongsToMany(Team, {
        through: TeamProduct,
        timestamps: false
    });

    return TeamProduct;
});
