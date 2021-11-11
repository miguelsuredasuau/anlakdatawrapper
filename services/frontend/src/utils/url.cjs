function formatQueryString(params) {
    return Object.entries(params)
        .filter(entry => entry[1] !== undefined && entry[1] !== null)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
}

module.exports = {
    formatQueryString
};
