const { createExports } = require('../utils/wrap');
module.exports = createExports();

const SQ = require('sequelize');

module.exports.dwORM$setInitializer(({ db }) => {
    const Product = db.define(
        'product',
        {
            id: {
                type: SQ.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            name: {
                type: SQ.STRING(512),
                allowNull: false
            },

            deleted: {
                type: SQ.BOOLEAN,
                defaultValue: false
            },

            priority: {
                type: SQ.INTEGER,
                defaultValue: 0
            },

            data: SQ.TEXT
        },
        {
            tableName: 'product'
        }
    );

    Product.prototype.getData = function () {
        return this.data ? JSON.parse(this.data) : {};
    };

    Product.prototype.hasFeature = function (key) {
        const data = this.getData();
        return !!data[key];
    };

    return Product;
});
