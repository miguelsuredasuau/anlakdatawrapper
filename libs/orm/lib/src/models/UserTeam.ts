import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('user_team')<typeof UserTeam>();
export default exported;
export type UserTeamModel = InstanceType<typeof UserTeam>;

import SQ, { ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import User from './User';
import Team from './Team';

const teamRoleValues = ['owner', 'admin', 'member'] as const;

class UserTeam extends Model<InferAttributes<UserTeam>, InferCreationAttributes<UserTeam>> {
    declare user_id: ForeignKey<number>;
    declare organization_id: ForeignKey<string>;
    declare team_role: typeof teamRoleValues[number];
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
                    // Sequelize v6 types do not support model field and DB field having different types https://github.com/sequelize/sequelize/issues/13522
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const teamRole: number = this.getDataValue('team_role') as any;
                    return teamRoleValues[teamRole];
                },
                set(val) {
                    if (typeof val === 'string') {
                        const index = (teamRoleValues as readonly string[]).indexOf(val);
                        // Sequelize v6 types do not support model field and DB field having different types https://github.com/sequelize/sequelize/issues/13522
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if (index > -1) this.setDataValue('team_role', index as any);
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
