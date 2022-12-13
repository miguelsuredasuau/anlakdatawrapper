"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chartAttributes = void 0;
const sequelize_1 = __importDefault(require("sequelize"));
exports.chartAttributes = {
    id: { type: sequelize_1.default.STRING(5), primaryKey: true },
    type: sequelize_1.default.STRING,
    title: sequelize_1.default.STRING,
    theme: sequelize_1.default.STRING,
    guest_session: sequelize_1.default.STRING,
    last_edit_step: sequelize_1.default.INTEGER,
    published_at: sequelize_1.default.DATE,
    public_url: sequelize_1.default.STRING,
    public_version: sequelize_1.default.INTEGER,
    deleted: sequelize_1.default.BOOLEAN,
    deleted_at: sequelize_1.default.DATE,
    forkable: sequelize_1.default.BOOLEAN,
    is_fork: sequelize_1.default.BOOLEAN,
    metadata: sequelize_1.default.JSON,
    language: sequelize_1.default.STRING(5),
    external_data: sequelize_1.default.STRING(),
    utf8: sequelize_1.default.BOOLEAN,
    createdAt: sequelize_1.default.DATE,
    last_modified_at: sequelize_1.default.DATE
};
