import get from '@datawrapper/shared/get';
import { getThemeStyleHelpers, toPixel, lineHeight, isTrue } from '../shared.mjs';

export default function (emotion, themeData) {
    const { css, getProp } = getThemeStyleHelpers(emotion, themeData);
    return css`
        margin: ${getProp('style.header.description.margin', '5px 0 10px')};
        padding: ${getProp('style.header.description.padding')};
        text-align: ${getProp('style.header.description.textAlign')};

        border-top: ${getProp('style.header.description.border.top')};
        border-left: ${getProp('style.header.description.border.left')};
        border-right: ${getProp('style.header.description.border.right')};
        border-bottom: ${getProp('style.header.description.border.bottom')};
        background: ${getProp('style.header.description.background')};

        font-family: ${getProp('typography.description.typeface')};
        font-weight: ${getProp('typography.description.fontWeight')};
        font-size: ${toPixel(getProp('typography.description.fontSize'))};
        font-stretch: ${getProp('typography.description.fontStretch')};
        text-transform: ${getProp('typography.description.textTransform')};
        line-height: ${lineHeight(getProp('typography.description.lineHeight'))};

        letter-spacing: ${toPixel(getProp('typography.description.letterSpacing'))};
        font-style: ${isTrue(get(themeData, 'typography.description.cursive'))
            ? 'italic'
            : 'normal'};
        text-decoration: ${isTrue(get(themeData, 'typography.description.underlined'))
            ? 'underline'
            : 'none'};
        color: ${getProp('typography.description.color')};
    `;
}
