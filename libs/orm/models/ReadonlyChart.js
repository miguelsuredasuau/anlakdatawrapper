const { createExports } = require('../utils/wrap');
module.exports = createExports();

const pick = require('lodash/pick');
const Chart = require('./Chart');
const Team = require('./Team');
const User = require('./User');
const chartAttributes = require('./chartAttributes');

module.exports.dwORM$setInitializer(({ db }) => {
    class ReadonlyChart extends Chart.dwORM$getRawModelClass() {
        get user() {
            return this.dataValues.user;
        }

        static async fromChart(chart) {
            const readonlyChart = ReadonlyChart.build({ id: chart.id });
            readonlyChart.dataValues = { ...chart.dataValues };
            return readonlyChart;
        }

        static async fromPublicChart(chart, publicChart) {
            const readonlyChart = ReadonlyChart.build({ id: chart.id });
            readonlyChart.dataValues = {
                ...chart.dataValues,
                ...pick(publicChart.dataValues, [
                    'type',
                    'title',
                    'metadata',
                    'external_data',
                    'author_id',
                    'organization_id'
                ])
            };
            return readonlyChart;
        }
    }

    ReadonlyChart.init(chartAttributes, {
        sequelize: db,
        validate: {
            never() {
                throw new Error('ReadonlyChart can never be saved to the database');
            }
        }
    });

    ReadonlyChart.belongsTo(Chart, { foreignKey: 'forked_from' });
    ReadonlyChart.belongsTo(Team, { foreignKey: 'organization_id' });
    ReadonlyChart.belongsTo(User, { foreignKey: 'author_id' });

    return ReadonlyChart;
});
