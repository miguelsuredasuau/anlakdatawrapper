"use strict";
const nanoid_1 = require("nanoid");
const nanoid = (0, nanoid_1.customAlphabet)('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 5);
module.exports = async function findChartId(server) {
    const Chart = server.methods.getModel('chart');
    const id = nanoid();
    return (await Chart.findByPk(id)) ? findChartId(server) : id;
};
