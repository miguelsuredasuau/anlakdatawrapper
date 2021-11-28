module.exports = {
    name: 'features',
    version: '1.0.0',
    async register(server) {
        server.app.settingsPages = new Map();

        const defaultFeatures = new Map();

        /**
         * allow plugins to register features with the frontend server
         */
        server.method('registerFeature', (feature, defaultValue) => {
            defaultFeatures.set(feature, defaultValue);
        });

        /**
         * allow plugins to retrieve the feature value for a given user
         */
        server.method('getUserFeature', async (user, feature) => {
            const activeProduct = await user.getActiveProduct();
            try {
                const features = new Map(Object.entries(JSON.parse(activeProduct.data || '{}')));
                if (features.has(feature)) return features.get(feature);
                if (defaultFeatures.has(feature)) return defaultFeatures.get(feature);
                throw new Error('unknown feature flag: ' + feature);
            } catch (e) {
                throw new Error('broken product data: ' + activeProduct.id);
            }
        });
    }
};
