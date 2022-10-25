import { JSDOM } from 'jsdom';

const window = new JSDOM('', { pretendToBeVisual: true, url: 'https://example.org/' }).window;

/**
 * Copy all DOM top-level variables to Node's global scope.
 *
 * Inspired by browser-env. We can't use browser-env because it has old jsdom version.
 *
 * @see https://github.com/lukechilds/browser-env/blob/master/src/index.js
 */
Object.getOwnPropertyNames(window)
    .filter(prop => prop !== 'undefined' && global[prop] === undefined)
    .forEach(prop =>
        Object.defineProperty(global, prop, {
            configurable: true,
            set: val => {
                window[prop] = val;
            },
            get: () => window[prop]
        })
    );
