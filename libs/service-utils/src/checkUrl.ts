export = function checkUrl(url: string) {
    return !url.includes('://unix') && !url.startsWith('unix:');
};
