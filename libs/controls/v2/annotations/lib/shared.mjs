import get from '@datawrapper/shared/get';
import * as d3 from 'd3-color';

export function mergeWithTheme(defaultProps, themeData, key) {
    const themeProps = get(themeData, `style.chart.${key}Annotations`, {});
    if (key !== 'text' && typeof themeProps.opacity !== 'undefined') {
        themeProps.opacity = Math.round(themeProps.opacity * 100);
    }
    const propsWithTheme = { ...defaultProps, ...themeProps };
    if (key === 'text') {
        propsWithTheme.color = false;
    }
    return propsWithTheme;
}

export function getRangeAnnotationIcon(el, editorState) {
    const { dataToPx } = editorState;

    let icon = '';

    if (typeof dataToPx === 'function') {
        let offset, size;

        if (el.type === 'x') {
            let x = [dataToPx(el.x0, 0)[0], dataToPx(el.x1, 0)[0]];

            if (el.display !== 'line') {
                x = x.sort((a, b) => a - b);
            }

            offset = Math.round((x[0] / editorState.width) * 100);
            size =
                el.display === 'line'
                    ? '3px'
                    : Math.max(3, Math.round(((x[1] - x[0]) / editorState.width) * 100)) + '%';
        } else {
            let y = [dataToPx(0, el.y0)[1], dataToPx(0, el.y1)[1]];

            if (el.display !== 'line') {
                y = y.sort((a, b) => a - b);
            }

            offset = Math.round((y[0] / editorState.height) * 100);
            size =
                el.display === 'line'
                    ? '3px'
                    : Math.max(3, Math.round(((y[1] - y[0]) / editorState.height) * 100)) + '%';
        }

        const color = d3.color(el.color);
        const opacity = el.opacity / 100;
        const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.max(0.3, opacity)})`;
        offset =
            el.display === 'line' && el.strokeWidth === 3 ? `calc(${offset}% - 1px)` : `${offset}%`;

        let style = `${el.type === 'x' ? 'left' : 'top'}: ${offset};`;

        if (el.display === 'line') {
            style += `border-${el.type === 'x' ? 'left' : 'top'}: ${el.strokeWidth}px ${
                el.strokeType
            } ${rgba};`;
        } else {
            style += `${el.type === 'x' ? 'width' : 'height'}: ${size};`;
            style += `background: ${rgba};`;
        }

        icon = `<div class="mini-chart"><div class="${el.type} ${el.display}" style="${style}"></div></div>`;
    }

    return icon;
}
