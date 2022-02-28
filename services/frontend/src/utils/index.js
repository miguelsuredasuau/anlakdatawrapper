function byOrder(a, b) {
    return a.order !== undefined && b.order !== undefined ? a.order - b.order : 0;
}

module.exports = {
    byOrder
};
