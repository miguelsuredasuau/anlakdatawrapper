"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const Folder_1 = __importDefault(require("../Folder"));
const User_1 = __importDefault(require("../User"));
const init = () => {
    Folder_1.default.belongsTo(User_1.default, { foreignKey: 'user_id' });
    User_1.default.hasMany(Folder_1.default, { foreignKey: 'user_id' });
};
exports.init = init;
