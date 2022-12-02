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
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('product')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
class Product extends sequelize_1.Model {
    getData() {
        return this.data ? JSON.parse(this.data) : {};
    }
    hasFeature(key) {
        const data = this.getData();
        return !!data[key];
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    Product.init({
        id: {
            type: sequelize_1.default.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: sequelize_1.default.STRING(512),
            allowNull: false
        },
        deleted: {
            type: sequelize_1.default.BOOLEAN,
            defaultValue: false
        },
        priority: {
            type: sequelize_1.default.INTEGER,
            defaultValue: 0
        },
        data: sequelize_1.default.TEXT
    }, {
        tableName: 'product',
        ...initOptions
    });
    return Product;
});
