"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGCTrap = void 0;
function purge() {
    let available = false;
    if (typeof global.gc === 'function') {
        available = true;
        console.log('Before GC:', process.memoryUsage());
        try {
            global.gc();
        }
        catch (e) {
            available = false;
        }
    }
    if (!available) {
        console.error('`node --expose-gc index.js`');
    }
    else {
        console.log('After GC:', process.memoryUsage());
    }
}
function initGCTrap() {
    // use SIGALRM because it's an ancient C timer,
    // which is almost certainly not used in nodeJS
    process.on('SIGALRM', purge.bind(null));
}
exports.initGCTrap = initGCTrap;
