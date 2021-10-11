export default function patternPreview(opt, color) {
    function hashCode(str) {
        return str
            .split('')
            .reduce(
                (prevHash, currVal) => ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
                0
            );
    }

    let patternSvg = `<svg
       viewBox="0 0 58 58"
       height="58"
       width="58"
       preserveAspectRatio="none"
       style="background:${color === '#ffffff' ? '#e2e2e2' : 'none'}"
    >`;
    if (opt.value === 'solid') {
        patternSvg += `<rect x="0" y="0" width="100%" height="100%" fill="${color}"/>`;
    } else {
        patternSvg += `<defs>
            <pattern id="diagonalHatch-pattern-id" width="10" height="10" patternTransform="rotate(pattern-rotation 0 0)" patternUnits="userSpaceOnUse">
                <line x1="5" y1="0" x2="5" y2="10" style="stroke:${color}; stroke-width:3" />
            </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalHatch-pattern-id)"/>`
            .replace(/pattern-id/g, `${hashCode(color)}-${opt.rotation}`)
            .replace(/pattern-rotation/g, opt.rotation);
    }
    patternSvg += `</svg>`;
    return patternSvg;
}
