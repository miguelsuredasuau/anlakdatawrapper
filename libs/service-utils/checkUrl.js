function checkUrl(url) {
    if (url.indexOf('://unix:') > -1 || url.indexOf('unix:') === 0) {
        return false;
    }

    return true;
}

module.exports = checkUrl;
