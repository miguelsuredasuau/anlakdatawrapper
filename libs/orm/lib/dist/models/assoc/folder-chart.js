"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const Folder_1 = __importDefault(require("../Folder"));
const Chart_1 = __importDefault(require("../Chart"));
const init = () => {
    Chart_1.default.belongsTo(Folder_1.default, { foreignKey: 'in_folder' });
    Folder_1.default.hasMany(Chart_1.default, { foreignKey: 'in_folder' });
};
exports.init = init;
