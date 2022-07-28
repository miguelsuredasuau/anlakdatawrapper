const VIEW_REGEXP = /<script type="text\/javascript" src="\/lib\/csr\/(?<view>\w+\.svelte)\.js/;

/**
 * Create a HTTP headers object for session authentication of passed `userObj`.
 *
 * @param {Object} userObj - User object as returned by `api/test/helpers/setup#createUser()`.
 * @returns {Object} HTTP headers object that can be passed to `Hapi.Server.inject({ headers })`.
 */
export function getSessionHeaders(userObj) {
    return {
        cookie: `DW-SESSION=${userObj.session.id}; crumb=abc`,
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };
}

/**
 * Get the view name from `html` that was produced by the svelte-view plugin.
 *
 * @param {string} html - HTML document as a string.
 * @returns {string} View name, for example "Create.svelte".
 */
export function parseSvelteView(html) {
    const m = html.match(VIEW_REGEXP);
    if (m) {
        return m.groups.view;
    }
    return null;
}

const PROPS_REGEXP = /var props = JSON\.parse\((?<json>[^\n]+)\);/;

/**
 * Get the svelte properties from `html` that was produced by the svelte-view plugin.
 *
 * @param {string} html - HTML document as a string.
 * @returns {Object} Svelte properties object, for example { chartData: { title: "My chart" } }.
 */
export function parseSvelteProps(html) {
    const m = html.match(PROPS_REGEXP);
    if (m) {
        return JSON.parse(JSON.parse(m.groups.json));
    }
    return null;
}
