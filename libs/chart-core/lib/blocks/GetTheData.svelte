<script>
    export let props;
    const { get, __, purifyHtml } = props;
    $: ({ chart, dwChart, teamPublicSettings, themeData, postEvent } = props);

    $: externalData = get(chart, 'externalData');
    $: caption = get(themeData, 'options.blocks.get-the-data.data.caption', __('Get the data'));

    function createCSV() {
        const opts = {};
        if (teamPublicSettings.downloadDataLocalized) {
            opts.numeral = dwChart.vis().libraries().numeral;
        }
        const csv = dwChart.dataset().csv(opts);
        return '\uFEFF' + csv; // Add BOM, otherwise Excel doesn't open files as unicode.
    }

    function getFilename() {
        const defaultFilename = `data-${chart.id}.csv`;
        const filename = get(themeData, 'options.blocks.get-the-data.data.filename', '')
            .replace(/%custom_(.*?)%/g, (match, key) => get(chart, `metadata.custom.${key}`, ''))
            .replace(/%chart_id%/g, chart.id);
        return filename && filename !== '.csv' ? filename : defaultFilename;
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
        postEvent('download', { type: 'csv' });
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
    aria-label="{__(caption)}: {purifyHtml(chart.title, [])}"
    target={externalData ? '_blank' : '_self'}
    href={externalData || 'javascript:void(0)'}
    on:click={handleClick}
>
    {__(caption)}
</a>
