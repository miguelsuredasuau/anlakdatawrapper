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
const exported = (0, wrap_1.createExports)('folder')();
exports.default = exported;
const sequelize_1 = __importStar(require("sequelize"));
class Folder extends sequelize_1.Model {
    async isWritableBy(user) {
        if (user.role === 'admin')
            return true;
        if (this.user_id && this.user_id === user.id)
            return true;
        if (this.org_id)
            return user.hasActivatedTeam(this.org_id);
        return false;
    }
    async hasDescendant(folderId) {
        const children = await this.getChildren();
        const queue = [...children];
        while (queue.length) {
            const child = queue.shift();
            if (child?.id === folderId) {
                return true;
            }
            const grandchildren = await child?.getChildren();
            queue.push(...(grandchildren ?? []));
        }
        return false;
    }
    async hasParent(parentId) {
        // Mutable variable, we're starting with the current object and then go up
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current = this;
        while (current.parent_id !== null) {
            if (current.parent_id === parentId) {
                return true;
            }
            const parent = await Folder.findByPk(current.parent_id);
            if (!parent) {
                break;
            }
            current = parent;
        }
        return false;
    }
}
(0, wrap_1.setInitializer)(exported, ({ initOptions }) => {
    Folder.init({
        id: {
            type: sequelize_1.default.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'folder_id' // todo: rename db column
        },
        name: {
            type: sequelize_1.default.STRING,
            field: 'folder_name' // todo: rename db column
        }
    }, {
        timestamps: false,
        tableName: 'folder',
        validate: {
            notBothOrgAndUser() {
                if (this.org_id != null && this.user_id != null) {
                    // Use the equality not the identity operator to check for null or undefined.
                    throw new Error('Folder must not have both org_id and user_id set');
                }
            }
        },
        ...initOptions
    });
    Folder.belongsTo(Folder, { as: 'parent' });
    Folder.hasMany(Folder, { as: 'children', foreignKey: 'parent_id' });
    return Folder;
});
