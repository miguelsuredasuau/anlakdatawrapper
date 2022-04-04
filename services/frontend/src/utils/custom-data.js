const mergeDeep = require('merge-deep');

module.exports = {
    name: 'utils/custom-data',
    version: '1.0.0',
    async register(server) {
        /**
         * allow plugins to register custom data
         */
        const customDataHandlers = new Map();
        server.method('registerCustomData', (key, handler) => {
            if (!customDataHandlers.has(key)) {
                customDataHandlers.set(key, new Set());
            }
            customDataHandlers.get(key).add(handler);
        });

        /**
         * return registered custom data for specific key
         */
        server.method('getCustomData', async (key, { request }) => {
            if (!customDataHandlers.has(key)) return {};
            const customData = [];
            for (const handler of customDataHandlers.get(key)) {
                customData.push(await handler({ request }));
            }
            return mergeDeep({}, ...customData);
        });
    }
};
