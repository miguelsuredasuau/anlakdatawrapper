export function storeColor(color, palette, returnPaletteIndex) {
    if (typeof color === 'object' && typeof color.hex === 'function') {
        // color is a chroma.js instance
        color = color.hex();
    }
    if (returnPaletteIndex) {
        const paletteIndex = palette.map(c => c.toLowerCase()).indexOf(color.toLowerCase());
        if (paletteIndex > -1) return paletteIndex;
    }
    return color;
}

/**
 * @param {number|string} color - can be a string color (e.g. "#ff00cc") or a palette index
 * @param {array} palette - the theme color palette to lookup color indexes
 * @returns {string} hex representation
 */
export function getColor(color, palette) {
    return typeof color === 'number' && color < palette.length
        ? palette[color]
        : typeof color === 'object' && typeof color.hex === 'function'
        ? color.hex()
        : color;
}
