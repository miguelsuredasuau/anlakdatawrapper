/* eslint-disable no-console */

function purge() {
    let available = false;

    if (typeof global.gc === 'function') {
        available = true;
        console.log('Before GC:', process.memoryUsage());

        try {
            global.gc();
        } catch (e) {
            available = false;
        }
    }

    if (!available) {
        console.error('`node --expose-gc index.js`');
    } else {
        console.log('After GC:', process.memoryUsage());
    }
}

export function initGCTrap() {
    // use SIGALRM because it's an ancient C timer,
    // which is almost certainly not used in nodeJS
    process.on('SIGALRM', purge.bind(null));
}
