import { create } from '../../src/server.js';

export const mochaHooks = {
    beforeAll(done) {
        create().then(async server => {
            await server.initialize();
            this.server = server;
            done();
        });
    }
};
