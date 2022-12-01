const { getDB } = require('./internal-orm-state');
const models = require('./models');

module.exports = {
    rawQuery: (...args) => getDB().query(...args),
    withTransaction: (...args) => getDB().transaction(...args),
    models,
    ...models
};
