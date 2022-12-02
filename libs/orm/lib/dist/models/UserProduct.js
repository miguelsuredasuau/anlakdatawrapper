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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../utils/wrap");
const exported = (0, wrap_1.createExports)('user_product')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const User_1 = __importDefault(require("./User"));
const Product_1 = __importDefault(require("./Product"));
class UserProduct extends sequelize_1.Model {
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    UserProduct.init({
        user_id: sequelize_1.default.INTEGER,
        product_id: sequelize_1.default.INTEGER,
        created_by_admin: {
            type: sequelize_1.default.BOOLEAN,
            defaultValue: true
        },
        changes: sequelize_1.default.TEXT,
        expires: sequelize_1.default.DATE
    }, {
        tableName: 'user_product',
        timestamps: false,
        ...initOptions
    });
    User_1.default.belongsToMany(Product_1.default, {
        through: UserProduct,
        timestamps: false
    });
    Product_1.default.belongsToMany(User_1.default, {
        through: UserProduct,
        timestamps: false
    });
    return UserProduct;
});
