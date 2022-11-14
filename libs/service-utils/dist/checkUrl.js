"use strict";
module.exports = function checkUrl(url) {
    return !url.includes('://unix') && !url.startsWith('unix:');
};
