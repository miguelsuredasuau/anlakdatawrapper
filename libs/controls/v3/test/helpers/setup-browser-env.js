import jsdom from 'jsdom';
const { JSDOM } = jsdom;
const dom = new JSDOM('', {
    pretendToBeVisual: true // To make requestAnimationFrame available.
});

global.window = dom.window;
global.document = dom.window.document;
global.Event = dom.window.Event;

// Required by Svelte transitions.
// https://github.com/sveltejs/svelte/pull/1836
global.getComputedStyle = window.getComputedStyle;
global.requestAnimationFrame = window.requestAnimationFrame;
