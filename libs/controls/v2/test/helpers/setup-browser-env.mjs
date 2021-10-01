/* eslint-env node */
// Setup browser-env for use with AVA
// https://github.com/avajs/ava/blob/master/docs/recipes/browser-testing.md
import browserEnv from 'browser-env';

browserEnv(['window', 'document', 'navigator']);

// we need to add `getComputedStyle` to our environment, otherwise components
// that use `svelte-transitions-slide` (for example `SwitchControl`) will throw errors.
// See code here: https://github.com/sveltejs/svelte-transitions-slide/blob/6b494089aa465301f85cf33594b73fc309cd00ea/src/index.js#L7
// And probably related unresolved issue here: https://github.com/sveltejs/svelte-transitions-slide/issues/1
global.getComputedStyle = window.getComputedStyle;

// looks like Svelte transitions use `requestAnimationFrame` somewhere under the hood,
// so this also needs to be mocked
global.requestAnimationFrame = () => {};
