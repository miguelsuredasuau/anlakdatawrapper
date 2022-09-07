const SQ = require('sequelize');
const { db } = require('../index');

const Folder = db.define(
    'folder',
    {
        id: {
            type: SQ.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'folder_id' // todo: rename db column
        },

        name: {
            type: SQ.STRING,
            field: 'folder_name' // todo: rename db column
        }
    },
    {
        timestamps: false,
        tableName: 'folder',
        validate: {
            notBothOrgAndUser() {
                if (this.org_id != null && this.user_id != null) {
                    // Use the equality not the identity operator to check for null or undefined.
                    throw new Error('Folder must not have both org_id and user_id set');
                }
            }
        }
    }
);

Folder.belongsTo(Folder, { as: 'parent' });
Folder.hasMany(Folder, { as: 'children', foreignKey: 'parent_id' });

Folder.prototype.isWritableBy = async function (user) {
    if (user.role === 'admin') return true;
    if (this.user_id && this.user_id === user.id) return true;
    if (this.org_id) return user.hasActivatedTeam(this.org_id);
    return false;
};

Folder.prototype.hasDescendant = async function (folderId) {
    const children = await this.getChildren();
    const queue = [...children];
    while (queue.length) {
        const child = queue.shift();
        if (child.id === folderId) {
            return true;
        }
        const grandchildren = await child.getChildren();
        queue.push(...grandchildren);
    }
    return false;
};

Folder.prototype.hasParent = async function (parentId) {
    let current = this;
    while (current.parent_id !== null) {
        if (current.parent_id === parentId) {
            return true;
        }
        current = await Folder.findByPk(current.parent_id);
    }
    return false;
};

module.exports = Folder;
