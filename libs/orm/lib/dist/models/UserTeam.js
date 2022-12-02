"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('user_team')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const User_1 = __importDefault(require("./User"));
const Team_1 = __importDefault(require("./Team"));
const teamRoleValues = ['owner', 'admin', 'member'];
class UserTeam extends sequelize_1.Model {
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    UserTeam.init({
        team_role: {
            field: 'organization_role',
            type: sequelize_1.default.INTEGER,
            values: teamRoleValues,
            allowNull: false,
            defaultValue: 2,
            get() {
                const teamRole = this.getDataValue('team_role');
                return teamRoleValues[teamRole];
            },
            set(val) {
                if (typeof val === 'string') {
                    const index = teamRoleValues.indexOf(val);
                    if (index > -1)
                        this.setDataValue('team_role', index);
                }
            }
        },
        invite_token: {
            type: sequelize_1.default.STRING(128),
            allowNull: false,
            defaultValue: ''
        }
    }, {
        tableName: 'user_organization',
        createdAt: 'invited_at',
        ...initOptions
    });
    User_1.default.belongsToMany(Team_1.default, {
        through: {
            model: UserTeam
        },
        foreignKey: 'user_id',
        timestamps: false
    });
    Team_1.default.belongsToMany(User_1.default, {
        through: {
            model: UserTeam
        },
        foreignKey: 'organization_id',
        timestamps: false
    });
    UserTeam.belongsTo(User_1.default, { foreignKey: 'invited_by' });
    return UserTeam;
});
