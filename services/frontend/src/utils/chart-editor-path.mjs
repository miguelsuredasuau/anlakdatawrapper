export function getChartEditorPath(chartType) {
    switch (chartType) {
        case 'locator-map':
            return 'edit';
        case 'tables':
            return 'table';
        case 'd3-maps-choropleth':
        case 'd3-maps-symbols':
            return 'map';
        default:
            return 'chart';
    }
}
