"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('product_plugin')();
exports.default = exported;
const sequelize_1 = require("sequelize");
const Plugin_1 = __importDefault(require("./Plugin"));
const Product_1 = __importDefault(require("./Product"));
class ProductPlugin extends sequelize_1.Model {
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    ProductPlugin.init({}, {
        tableName: 'product_plugin',
        timestamps: false,
        ...initOptions
    });
    Plugin_1.default.belongsToMany(Product_1.default, {
        through: ProductPlugin,
        timestamps: false
    });
    Product_1.default.belongsToMany(Plugin_1.default, {
        through: ProductPlugin,
        timestamps: false
    });
    return ProductPlugin;
});
