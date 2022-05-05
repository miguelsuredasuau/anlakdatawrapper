const assert = require('assert');
const { byOrder } = require('./index');

module.exports = {
    name: 'utils/chart-actions',
    version: '1.0.0',
    async register(server) {
        /**
         * allow plugins to register chart actions to be shown
         * in publish step
         */
        const chartActionHandlers = new Set();
        server.method('registerChartAction', handler => {
            assert(typeof handler === 'function', 'handler must be a function');
            chartActionHandlers.add(handler);
        });

        /**
         * return registered custom data for specific key
         */
        server.method('getChartActions', async ({ request, chart, theme }) => {
            const chartActions = await Promise.all(
                Array.from(chartActionHandlers.values()).map(handler =>
                    handler({ request, chart, theme })
                )
            );
            return chartActions.filter(d => d).sort(byOrder);
        });
    }
};
