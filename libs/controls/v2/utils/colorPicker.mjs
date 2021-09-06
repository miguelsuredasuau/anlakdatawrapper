export function storeColor(color, palette, returnPaletteIndex) {
    if (typeof color === 'object' && typeof color.hex === 'function') {
        // color is a chroma.js instance
        color = color.hex();
    }
    if (returnPaletteIndex) {
        const pi = palette.map(c => c.toLowerCase()).indexOf(color.toLowerCase());
        if (pi > -1) return pi;
    }
    return color;
}

export function getColor(color, palette) {
    return typeof color === 'number' ? palette[color % palette.length] : color;
}