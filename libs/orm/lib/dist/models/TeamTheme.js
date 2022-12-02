"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('team_theme')();
exports.default = exported;
const sequelize_1 = require("sequelize");
const Team_1 = __importDefault(require("./Team"));
const Theme_1 = __importDefault(require("./Theme"));
class TeamTheme extends sequelize_1.Model {
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    TeamTheme.init({}, {
        tableName: 'organization_theme',
        timestamps: false,
        ...initOptions
    });
    Team_1.default.belongsToMany(Theme_1.default, {
        through: TeamTheme,
        foreignKey: 'organization_id',
        timestamps: false
    });
    Theme_1.default.belongsToMany(Team_1.default, {
        through: TeamTheme,
        foreignKey: 'theme_id',
        timestamps: false
    });
    return TeamTheme;
});
