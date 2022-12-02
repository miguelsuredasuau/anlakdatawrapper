// TODO: submit bug report to TS about import from nanoid incorrectly causing TS errors when moduleResolution set to "node16"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { customAlphabet } from 'nanoid';
import type { Server } from './serverTypes';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 5);

export async function findChartId(server: Server): Promise<string> {
    const Chart = server.methods.getModel('chart');
    const id = nanoid();
    return (await Chart.findByPk(id)) ? findChartId(server) : id;
}
