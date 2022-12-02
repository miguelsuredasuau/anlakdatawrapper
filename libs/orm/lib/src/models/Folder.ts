import { createExports, setInitializer } from '../utils/wrap';
const exported = createExports('folder')<typeof Folder>();
export default exported;
export type FolderModel = InstanceType<typeof Folder>;

import SQ, {
    CreationOptional,
    ForeignKey,
    HasManyGetAssociationsMixin,
    HasOneGetAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model
} from 'sequelize';
import type { TeamModel } from './Team';
import type { UserModel } from './User';

class Folder extends Model<InferAttributes<Folder>, InferCreationAttributes<Folder>> {
    declare id: CreationOptional<number>;
    declare name: string | null;
    declare user_id: ForeignKey<number>;
    declare org_id: ForeignKey<string>;
    declare parent_id: ForeignKey<number> | null;
    declare getChildren: HasManyGetAssociationsMixin<Folder>;
    declare getTeam: HasOneGetAssociationMixin<TeamModel>;

    async isWritableBy(user: UserModel) {
        if (user.role === 'admin') return true;
        if (this.user_id && this.user_id === user.id) return true;
        if (this.org_id) return user.hasActivatedTeam(this.org_id);
        return false;
    }

    async hasDescendant(folderId: number) {
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

    async hasParent(parentId: number) {
        // Mutable variable, we're starting with the current object and then go up
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current: Folder = this;
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

setInitializer(exported, ({ initOptions }) => {
    Folder.init(
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
                notBothOrgAndUser(this: Folder) {
                    if (this.org_id != null && this.user_id != null) {
                        // Use the equality not the identity operator to check for null or undefined.
                        throw new Error('Folder must not have both org_id and user_id set');
                    }
                }
            },
            ...initOptions
        }
    );

    Folder.belongsTo(Folder, { as: 'parent' });
    Folder.hasMany(Folder, { as: 'children', foreignKey: 'parent_id' });

    return Folder;
});
