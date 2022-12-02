"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const User_1 = __importDefault(require("../User"));
const Chart_1 = __importDefault(require("../Chart"));
const init = () => {
    Chart_1.default.belongsTo(User_1.default, { foreignKey: 'author_id' });
    User_1.default.hasMany(Chart_1.default, { foreignKey: 'author_id' });
};
exports.init = init;
