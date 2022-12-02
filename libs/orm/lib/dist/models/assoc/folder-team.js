"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const Folder_1 = __importDefault(require("../Folder"));
const Team_1 = __importDefault(require("../Team"));
const init = () => {
    Folder_1.default.belongsTo(Team_1.default, { foreignKey: 'org_id' });
    Team_1.default.hasMany(Folder_1.default, { foreignKey: 'org_id' });
};
exports.init = init;
