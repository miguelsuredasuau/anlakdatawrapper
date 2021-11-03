import purifyHtml from '@datawrapper/shared/purifyHtml.js';
const DEFAULT_ALLOWED = '<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>';

export function clean(s, alsoAllow = '') {
    return purifyHtml(s, DEFAULT_ALLOWED + alsoAllow);
}
