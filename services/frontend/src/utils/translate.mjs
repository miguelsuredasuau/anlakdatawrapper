import purifyHtml from '@datawrapper/shared/purifyHtml.js';

const ALLOWED_HTML =
    '<p><h1><h2><h3><h4><h5><h6><blockquote><ol><ul><li><pre><hr><br>' + // Block elements (Markdown official)
    '<a><em><i><strong><b><code><img>' + // Inline elements (Markdown official)
    '<table><tr><th><td>' + // Tables
    '<small><span><div><sup><sub><tt>'; // Additional tags to support advanced customization

function getText(key, scope = 'core', messages) {
    try {
        const msg = messages[scope];
        return msg[key] || key;
    } catch (e) {
        return key;
    }
}

export default function translate(key, scope = 'core', messages, replacements = {}) {
    let text = getText(key, scope, messages);
    Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`%${k}%|%${k}(?!\\w)`, 'g'), v);
    });
    return purifyHtml(text, ALLOWED_HTML);
}
