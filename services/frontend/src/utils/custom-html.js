module.exports = {
    name: 'utils/custom-html',
    version: '1.0.0',
    async register(server) {
        /**
         * allow plugins to register custom html
         */
        const customHTMLHandlers = new Map();
        server.method('registerCustomHTML', (key, handler) => {
            if (!customHTMLHandlers.has(key)) {
                customHTMLHandlers.set(key, new Set());
            }
            customHTMLHandlers.get(key).add(handler);
        });

        /**
         * return registered custom html for specific key
         */
        server.method('getCustomHTML', async (key, { request }) => {
            if (!customHTMLHandlers.has(key)) return;
            const customHTML = [];
            for (const handler of customHTMLHandlers.get(key)) {
                customHTML.push(await handler({ request }));
            }
            return customHTML.filter(d => d).join('\n\n');
        });
    }
};
