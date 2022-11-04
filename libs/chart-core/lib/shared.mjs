import purifyHtml from '@datawrapper/shared/purifyHtml.js';
import chroma from 'chroma-js';

const DEFAULT_ALLOWED = [
    'a',
    'span',
    'b',
    'br',
    'i',
    'strong',
    'sup',
    'sub',
    'strike',
    'u',
    'em',
    'tt'
];

export function clean(s, alsoAllow = []) {
    return purifyHtml(s, alsoAllow.length ? [...DEFAULT_ALLOWED, ...alsoAllow] : DEFAULT_ALLOWED);
}

export function isTransparentColor(color) {
    return color === 'transparent' || !chroma(color).alpha();
}

const FLAG_BOOL_FALSE = new Set(['0', 'false', 'null']);

function parseFlags(getValue, flagTypes) {
    return Object.fromEntries(
        Object.entries(flagTypes).map(([key, type]) => {
            const val = getValue(key);
            if (type === Boolean) {
                return [key, !!val && !FLAG_BOOL_FALSE.has(val)];
            }
            return [key, val && type(val)];
        })
    );
}

export function parseFlagsFromElement(el, flagTypes) {
    return parseFlags(key => el.getAttribute(`data-${key}`), flagTypes);
}

export function parseFlagsFromURL(searchString, flagTypes) {
    const urlParams = new URLSearchParams(searchString);
    return parseFlags(key => urlParams.get(key), flagTypes);
}
