const URL = require('url');
const normalizeUrl = require('normalize-url');

function getDomain(url) {
    const hn = URL.parse(url).hostname;
    try {
        return hn ? hn.replace(/^www\./, '') : hn;
    } catch (e) {
        return null;
    }
}

function getNormalizedUrl(url) {
    try {
        return normalizeUrl(url, {
            normalizeHttps: true,
            removeQueryParameters: [/.*/],
            removeDirectoryIndex: true
        });
    } catch (e) {
        return url;
    }
}

module.exports = {
    getDomain,
    getNormalizedUrl
};
