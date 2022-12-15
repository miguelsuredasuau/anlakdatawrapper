import get from '@datawrapper/shared/get';
import { getThemeStyleHelpers, toPixel, lineHeight, isTrue } from '../shared.mjs';

export default function (emotion, themeData) {
    const { css, getProp } = getThemeStyleHelpers(emotion, themeData);
    return css`
        position: relative;
        color: ${getProp('typography.notes.color')};
        font-family: ${getProp('typography.notes.typeface')};
        font-size: ${toPixel(getProp('typography.notes.fontSize'))};
        font-stretch: ${getProp('typography.notes.fontStretch')};
        font-style: ${isTrue(get(themeData, 'typography.notes.cursive')) ? 'italic' : 'normal'};
        font-weight: ${getProp('typography.notes.fontWeight')};
        letter-spacing: ${toPixel(getProp('typography.notes.letterSpacing'))};
        line-height: ${lineHeight(getProp('typography.notes.lineHeight'))};
        margin: ${getProp('style.notes.margin')};
        padding: ${getProp('style.notes.padding')};
        text-align: ${getProp('style.notes.textAlign')};
        text-decoration: ${isTrue(get(themeData, 'typography.notes.underlined'))
            ? 'underline'
            : 'none'};
        text-transform: ${getProp('typography.notes.textTransform')};

        a {
            padding: ${getProp('style.footer.links.padding')};
            border-bottom: ${getProp('style.footer.links.border.bottom')};
            font-style: ${isTrue(get(themeData, 'typography.notes.cursive')) ||
            isTrue(get(themeData, 'typography.links.cursive'))
                ? 'italic'
                : 'normal'};
        }
    `;
}
