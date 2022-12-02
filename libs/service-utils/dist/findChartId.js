"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findChartId = void 0;
// TODO: submit bug report to TS about import from nanoid incorrectly causing TS errors when moduleResolution set to "node16"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const nanoid_1 = require("nanoid");
const nanoid = (0, nanoid_1.customAlphabet)('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 5);
async function findChartId(server) {
    const Chart = server.methods.getModel('chart');
    const id = nanoid();
    return (await Chart.findByPk(id)) ? findChartId(server) : id;
}
exports.findChartId = findChartId;
