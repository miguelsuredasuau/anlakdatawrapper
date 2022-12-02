declare const exported: import("../utils/wrap").ExportedLite<"folder", typeof Folder>;
export default exported;
export type FolderModel = InstanceType<typeof Folder>;
import { CreationOptional, ForeignKey, HasManyGetAssociationsMixin, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import type { UserModel } from './User';
declare class Folder extends Model<InferAttributes<Folder>, InferCreationAttributes<Folder>> {
    id: CreationOptional<number>;
    name: string | null;
    user_id: ForeignKey<number>;
    org_id: ForeignKey<string>;
    parent_id: ForeignKey<number> | null;
    getChildren: HasManyGetAssociationsMixin<Folder>;
    isWritableBy(user: UserModel): Promise<boolean>;
    hasDescendant(folderId: number): Promise<boolean>;
    hasParent(parentId: number): Promise<boolean>;
}
