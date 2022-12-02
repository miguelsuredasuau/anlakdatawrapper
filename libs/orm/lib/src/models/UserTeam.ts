import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('user_team')<typeof UserTeam>();
export default exported;
export type UserTeamModel = InstanceType<typeof UserTeam>;

import SQ, {
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute
} from 'sequelize';
import User from './User';
import Team from './Team';

const teamRoleValues = ['owner', 'admin', 'member'] as const;

interface AdditionalRawAttributes {
    team_role: number | typeof teamRoleValues[number];
}

class UserTeam extends Model<
    InferAttributes<UserTeam> & AdditionalRawAttributes,
    InferCreationAttributes<UserTeam> & AdditionalRawAttributes
> {
    declare user_id: ForeignKey<number>;
    declare organization_id: ForeignKey<string>;
    declare team_role: NonAttribute<typeof teamRoleValues[number]>;
    declare invite_token: string | undefined;
}

setInitializer(exported, ({ initOptions }) => {
    UserTeam.init(
        {
            team_role: {
                field: 'organization_role',
                type: SQ.INTEGER,
                values: teamRoleValues,
                allowNull: false,
                defaultValue: 2, // member
                get() {
                    const teamRole = this.getDataValue('team_role') as number;
                    return teamRoleValues[teamRole];
                },
                set(val) {
                    if (typeof val === 'string') {
                        const index = (teamRoleValues as readonly string[]).indexOf(val);
                        if (index > -1) this.setDataValue('team_role', index);
                    }
                }
            },

            invite_token: {
                type: SQ.STRING(128),
                allowNull: false,
                defaultValue: ''
            }
        },
        {
            tableName: 'user_organization',
            createdAt: 'invited_at',
            ...initOptions
        }
    );

    User.belongsToMany(Team, {
        through: {
            model: UserTeam
        },
        foreignKey: 'user_id',
        timestamps: false
    });

    Team.belongsToMany(User, {
        through: {
            model: UserTeam
        },
        foreignKey: 'organization_id',
        timestamps: false
    });

    UserTeam.belongsTo(User, { foreignKey: 'invited_by' });

    return UserTeam;
});
