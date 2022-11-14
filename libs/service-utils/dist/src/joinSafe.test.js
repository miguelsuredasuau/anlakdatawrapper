"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const path_1 = require("path");
const joinSafe_1 = __importDefault(require("./joinSafe"));
(0, ava_1.default)('sub-paths work fine', t => {
    const rootDir = __dirname;
    t.is((0, joinSafe_1.default)(rootDir, 'package.json'), (0, path_1.join)(rootDir, 'package.json'));
    t.is((0, joinSafe_1.default)(rootDir, '.github', 'workflows'), (0, path_1.join)(rootDir, '.github', 'workflows'));
});
(0, ava_1.default)('breaking out of root fails', t => {
    const rootDir = __dirname;
    t.throws(() => (0, joinSafe_1.default)(rootDir, '../schemas/package.json'));
});
