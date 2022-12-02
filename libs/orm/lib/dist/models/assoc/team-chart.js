"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const Team_1 = __importDefault(require("../Team"));
const Chart_1 = __importDefault(require("../Chart"));
const init = () => {
    Chart_1.default.belongsTo(Team_1.default, { foreignKey: 'organization_id' });
    Team_1.default.hasMany(Chart_1.default, { foreignKey: 'organization_id' });
};
exports.init = init;
