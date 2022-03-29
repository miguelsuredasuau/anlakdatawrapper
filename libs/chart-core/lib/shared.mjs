import purifyHtml from '@datawrapper/shared/purifyHtml.js';
import chroma from 'chroma-js';
const DEFAULT_ALLOWED = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

export function clean(s, alsoAllow = '') {
    return purifyHtml(s, DEFAULT_ALLOWED + alsoAllow);
}

export function isTransparentColor(color) {
    return color === 'transparent' || !chroma(color).alpha();
}
