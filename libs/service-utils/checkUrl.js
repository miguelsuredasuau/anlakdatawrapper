function checkUrl(url) {
    return !url.includes('://unix') && !url.startsWith('unix:');
}

module.exports = checkUrl;
