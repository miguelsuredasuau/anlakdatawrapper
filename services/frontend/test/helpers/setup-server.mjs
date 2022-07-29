import { dirname, join } from 'path';
import { create } from '../../src/server.js';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const mochaHooks = {
    beforeAll(done) {
        create({ usePlugins: false }).then(async server => {
            await server.initialize();

            this.server = server;

            // Register fake d3-bars type.
            server.methods.registerVisualization('d3-bars', [
                {
                    id: 'd3-bars',
                    dependencies: {},
                    less: join(__dirname, '../data/chart.less'),
                    script: join(__dirname, '../data/chart.js')
                }
            ]);

            done();
        });
    }
};
