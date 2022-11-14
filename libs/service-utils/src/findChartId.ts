import { customAlphabet } from 'nanoid';
import type { Chart as TChart } from './chartModelTypes';
import type { Server } from './serverTypes';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 5);

export = async function findChartId(server: Server): Promise<string> {
    const Chart = server.methods.getModel<typeof TChart>('chart');
    const id = nanoid();
    return (await Chart.findByPk(id)) ? findChartId(server) : id;
};
