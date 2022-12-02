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
const exported = (0, wrap_1.createExports)('session')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
const phpSerialize_1 = require("../utils/phpSerialize");
class Session extends sequelize_1.Model {
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    Session.init({
        id: {
            type: sequelize_1.default.STRING(32),
            primaryKey: true,
            autoIncrement: false,
            field: 'session_id'
        },
        user_id: {
            type: sequelize_1.default.INTEGER,
            allowNull: true
        },
        persistent: sequelize_1.default.BOOLEAN,
        data: {
            type: sequelize_1.default.TEXT,
            allowNull: false,
            field: 'session_data',
            get() {
                const d = this.getDataValue('data');
                if (d) {
                    // Sequelize v6 types do not support model field and DB field having different types https://github.com/sequelize/sequelize/issues/13522
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const data = (0, phpSerialize_1.unserializeSession)(d);
                    return data;
                }
                return {};
            },
            set(data) {
                // WARNING, this will destroy parts of our sessions
                // Sequelize v6 types do not support model field and DB field having different types https://github.com/sequelize/sequelize/issues/13522
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.setDataValue('data', (0, phpSerialize_1.serializeSession)(data));
            }
        }
    }, {
        createdAt: 'date_created',
        updatedAt: 'last_updated',
        tableName: 'session',
        ...initOptions
    });
    return Session;
});
