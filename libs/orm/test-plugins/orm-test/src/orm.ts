import { SQ, type DB } from '@datawrapper/orm-lib';

export class ORMTest extends SQ.Model<
    SQ.InferAttributes<ORMTest>,
    SQ.InferCreationAttributes<ORMTest>
> {
    declare id: SQ.CreationOptional<number>;
    declare data: string;
}

export type ORMTestClassType = typeof ORMTest;

export const register = async ({ db }: { db: DB }) => {
    ORMTest.init(
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            data: {
                type: SQ.STRING(),
                field: 'value'
            }
        },
        {
            modelName: 'orm_test',
            sequelize: db
        }
    );
    await ORMTest.sync();
    return ORMTest;
};
