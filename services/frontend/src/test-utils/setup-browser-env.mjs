import sinon from 'sinon';
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
            set: () => {},
            get: () => window[prop]
        })
    );

/**
 * Mock URL.createObjectURL().
 *
 * @see https://github.com/jsdom/jsdom/issues/1721
 */
Object.defineProperty(global.URL, 'createObjectURL', {
    value: function () {
        return 'blob:mock';
    }
});

/**
 * Add support for TextRange.
 *
 * Required by CodeMirror.
 *
 * @see https://github.com/jsdom/jsdom/issues/3002
 */
document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = () => {
        return {
            x: 0,
            y: 0,
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0,
            toJSON: () => {}
        };
    };

    range.getClientRects = () => {
        return {
            item: () => null,
            length: 0,
            *[Symbol.iterator]() {}
        };
    };

    return range;
};

window.history.replaceState = sinon.fake();
