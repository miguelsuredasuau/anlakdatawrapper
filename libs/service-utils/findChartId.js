const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 5);

async function findChartId(server) {
    const Chart = server.methods.getModel('chart');
    const id = nanoid();
    return (await Chart.findByPk(id)) ? findChartId(server) : id;
}

module.exports = findChartId;
