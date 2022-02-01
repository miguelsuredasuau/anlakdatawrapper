<script>
    export let props;
    const { get, __, purifyHtml } = props;
    $: ({ chart, dwChart, data, teamPublicSettings, theme } = props);

    $: externalData = get(chart, 'externalData');
    $: caption = get(theme, 'data.options.blocks.get-the-data.data.caption', __('Get the data'));

    function createCSV() {
        if (teamPublicSettings.downloadDataLocalized) {
            const { numeral } = dwChart.vis().libraries();
            return dwChart.dataset().csv({ numeral });
        }
        return dwChart.dataset().csv();
    }

    function getFilename() {
        const defaultFilename = `data-${chart.id}.csv`;
        return (
            get(theme, 'data.options.blocks.get-the-data.data.filename', '')
                .replace(/%custom_(.*?)%/g, (match, key) =>
                    get(chart, `metadata.custom.${key}`, '')
                )
                .replace(/%chart_id%/g, chart.id) || defaultFilename
        );
    }

    function download(data, filename) {
        const blob = new Blob([data]);
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        }
    }

    function handleClick(event) {
        if (!externalData && dwChart && dwChart.dataset) {
            const csv = createCSV();
            const filename = getFilename();
            download(csv, filename);
            event.preventDefault();
        }
    }
</script>

<a
    class="dw-data-link"
    aria-label="{__(caption)}: {purifyHtml(chart.title, '')}"
    target={externalData ? '_blank' : '_self'}
    href={externalData || 'javascript:void(0)'}
    on:click={handleClick}
>
    {__(caption)}
</a>
