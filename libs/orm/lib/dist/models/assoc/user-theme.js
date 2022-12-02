"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const User_1 = __importDefault(require("../User"));
const Theme_1 = __importDefault(require("../Theme"));
const init = () => {
    User_1.default.belongsToMany(Theme_1.default, {
        through: 'user_theme',
        timestamps: false
    });
    Theme_1.default.belongsToMany(User_1.default, {
        through: 'user_theme',
        timestamps: false
    });
};
exports.init = init;
