export const defaultProps = {
    text: {
        x: 1,
        y: 1,
        dx: 0,
        dy: 0,
        width: undefined,
        align: 'tl',
        size: 14,
        color: false,
        bg: false,
        bold: false,
        italic: false,
        underline: false,
        showMobile: true,
        showDesktop: true,
        mobileFallback: true,
        text: 'Type your annotation text here',
        connectorLine: {
            enabled: false,
            arrowHead: 'lines',
            type: 'straight',
            targetPadding: 4,
            stroke: 1,
            inheritColor: false,
            circle: false,
            circleStyle: 'solid',
            circleRadius: 15
        }
    },
    range: {
        color: '#888',
        opacity: 10,
        strokeWidth: 1,
        strokeType: 'solid'
    },
    line: {
        color: '#888',
        opacity: 50,
        strokeWidth: 1,
        strokeType: 'solid'
    }
};
