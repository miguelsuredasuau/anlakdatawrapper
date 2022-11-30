const fs = require('fs/promises');
const path = require('path');

module.exports = {
    register: async server => {
        const datasets = JSON.parse(
            await fs.readFile(path.join(__dirname, 'datasets.json'), 'utf-8')
        );
        server.methods.registerDemoDatasets(({ chart }) => {
            return datasets.filter(ds => {
                return chart.type === 'tables'
                    ? ds.presets.type === 'tables'
                    : ds.presets.type !== 'tables';
            });
        });
    }
};
