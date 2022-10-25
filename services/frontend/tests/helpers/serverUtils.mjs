import chai from 'chai';
import chaiDOM from 'chai-dom';
import { JSDOM } from 'jsdom';

chai.use(chaiDOM);

const VIEW_REGEXP = /require\(\['\/lib\/csr\/(?<view>[\w/-]+\.svelte)\.js/;

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
 * Returns a wrapper around got for making authenticated API requests as passed `userObj`.
 *
 * @see ../../src/utils/api.js#createAPI()
 *
 * @param {Object} userObj - User object as returned by `api/test/helpers/setup#createUser()`.
 * @returns {function}
 */
export function createAPIForUser(server, userObj) {
    return server.methods.createAPI({
        auth: {
            credentials: {
                data: {
                    id: userObj.session.id
                }
            }
        }
    });
}

/**
 * Get Svelte view name from `html` that was produced by the SvelteView plugin.
 *
 * @param {string} html - HTML document as a string.
 * @returns {string} View name, for example "account/Settings.svelte".
 */
export function parseSvelteView(html) {
    const m = html.match(VIEW_REGEXP);
    if (m) {
        return m.groups.view;
    }
    return null;
}

const PROPS_REGEXP = /(var props|window\.__DW_SVELTE_PROPS__) = JSON\.parse\((?<json>[^\n]+)\);/;

/**
 * Get Svelte properties from `html` that was produced by the SvelteView plugin.
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

export function parseHTML(html) {
    const { document } = new JSDOM(html).window;
    return {
        document,
        $(selector) {
            return document.querySelector(selector);
        },
        $$(selector) {
            return document.querySelectorAll(selector);
        }
    };
}
