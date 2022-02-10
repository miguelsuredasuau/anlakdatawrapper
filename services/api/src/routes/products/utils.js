function serializeProduct(product) {
    return {
        id: product.id,
        name: product.name,
        deleted: product.deleted,
        priority: product.priority,
        data: product.data && JSON.parse(product.data),
        createdAt: product.createdAt
    };
}

module.exports = { serializeProduct };
