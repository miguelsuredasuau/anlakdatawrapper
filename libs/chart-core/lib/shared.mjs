import purifyHtml from '@datawrapper/shared/purifyHtml.js';
import get from '@datawrapper/shared/get.js';
import set from '@datawrapper/shared/set.js';
import chroma from 'chroma-js';
import clone from '@datawrapper/shared/clone.js';
import { all, any } from 'underscore';

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

/**
 * Resolve logical expressions
 *
 * @param {array} condition - condition expression
 * @param {object} context - context for get expressions
 * @returns {*} resolved value
 */
export function resolveCondition(condition, context) {
    return resolve(condition);
    function resolve(cond) {
        if (Array.isArray(cond)) {
            const op = cond[0];
            if (cond.length >= 2 && op === 'all') return all(cond.slice(1).map(resolve));
            if (cond.length >= 2 && op === 'any') return any(cond.slice(1).map(resolve));
            if (cond.length === 2 && op === '!') return !resolve(cond[1]);
            if (cond.length === 2 && op === 'get') return get(context, cond[1]);
            if (cond.length === 2 && op === 'has') return !!get(context, cond[1]);
            if (cond.length === 2 && op === 'length') return resolve(cond[1]).length;
            if (cond.length === 2 && op === 'stripHtml') return purifyHtml(resolve(cond[1]), []);
            if (cond.length === 3 && op === '==') return resolve(cond[1]) === resolve(cond[2]);
            if (cond.length === 3 && op === '!=') return resolve(cond[1]) !== resolve(cond[2]);
            if (cond.length === 3 && op === '>') return resolve(cond[1]) > resolve(cond[2]);
            if (cond.length === 3 && op === '>=') return resolve(cond[1]) >= resolve(cond[2]);
            if (cond.length === 3 && op === '<') return resolve(cond[1]) < resolve(cond[2]);
            if (cond.length === 3 && op === '<=') return resolve(cond[1]) <= resolve(cond[2]);
            if (cond.length === 3 && op === 'in')
                return resolve(cond[2]).includes(resolve(cond[1]));
            return cond; // normal array
        } else {
            // raw value
            return cond;
        }
    }
}

/**
 * compute themeData with overrides
 *
 * @param {object} themeData - source theme.data object
 * @param {object} context - the chart context to evaluate the override conditions in
 * @returns {object} - themeData with overrides
 */
export function computeThemeData(themeData, context = {}) {
    if (themeData.overrides && themeData.overrides.length > 0) {
        const themeDataClone = clone(themeData);
        for (const override of themeData.overrides) {
            if (!override.type && override.condition) {
                if (resolveCondition(override.condition, context)) {
                    for (const [key, value] of Object.entries(override.settings)) {
                        if (key.startsWith('overrides.'))
                            throw new Error('overrides may not change overrides');
                        set(themeDataClone, key, value);
                    }
                }
            }
        }
        return themeDataClone;
    }
    return themeData;
}

const UNDEFINED_STYLE = '%UNDEFINED%';

export function getThemeStyleHelpers(emotion, themeData) {
    const cssTemplate = (literals, ...expressions) => {
        let raw = '';
        for (const line of literals) {
            raw += line + expressions.shift();
        }
        return raw
            .split('\n')
            .filter(line => line)
            .filter(line => !line.includes(UNDEFINED_STYLE))
            .join('\n');
    };

    return {
        getProp: (key, _default) =>
            get(themeData, key, _default === undefined ? UNDEFINED_STYLE : _default),
        css: (...args) => emotion.css(cssTemplate(...args)),
        cssTemplate
    };
}

export function toPixel(value) {
    if (value === UNDEFINED_STYLE) return value;
    if (Number.isFinite(value)) return `${value}px`;
    return value;
}

export function lineHeight(value) {
    if (value === UNDEFINED_STYLE) return value;
    return value > 3 ? `${value}px` : String(value);
}

export function isTrue(value) {
    return value === 1 || value === true;
}
