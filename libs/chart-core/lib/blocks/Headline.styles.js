import get from '@datawrapper/shared/get';
import { getThemeStyleHelpers, toPixel, lineHeight, isTrue } from '../shared.mjs';

export default function (emotion, themeData) {
    const { css, getProp } = getThemeStyleHelpers(emotion, themeData);
    return css`
        margin: ${getProp('style.header.title.margin', '0 0 10px')};
        padding: ${getProp('style.header.title.padding')};
        border-top: ${getProp('style.header.title.border.top')};
        border-bottom: ${getProp('style.header.title.border.bottom')};
        border-left: ${getProp('style.header.title.border.left')};
        border-right: ${getProp('style.header.title.border.right')};
        background: ${getProp('style.header.title.background')};

        font-family: ${getProp('typography.headline.typeface')};
        font-weight: ${getProp('typography.headline.fontWeight')};
        font-size: ${toPixel(getProp('typography.headline.fontSize'))};
        font-stretch: ${getProp('typography.headline.fontStretch')};
        line-height: ${lineHeight(getProp('typography.headline.lineHeight'))};

        text-transform: ${getProp('typography.headline.textTransform')};
        letter-spacing: ${toPixel(getProp('typography.headline.letterSpacing'))};
        font-style: ${isTrue(get(themeData, 'typography.headline.cursive')) ? 'italic' : 'normal'};
        text-decoration: ${isTrue(get(themeData, 'typography.headline.underlined'))
            ? 'underline'
            : 'none'};
        color: ${getProp('typography.headline.color')};
        text-align: ${getProp('style.header.title.textAlign')};
    `;
}
