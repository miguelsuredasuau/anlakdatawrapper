const SQ = require('sequelize');

module.exports = {
    register: async ORM => {
        const ORMTest = ORM.db.define('orm_test', {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            data: {
                type: SQ.STRING(),
                field: 'value'
            }
        });
        await ORMTest.sync();
        return ORMTest;
    }
};
