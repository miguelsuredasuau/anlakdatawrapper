<script type="text/javascript">
    import ChartPreviewIframeDisplay from '_partials/displays/ChartPreviewIframeDisplay.svelte';
    import FormFieldDisplay from '_partials/displays/FormFieldDisplay.svelte';
    import RadioInput from '_partials/controls/RadioInput.svelte';

    export let chart;
    export let theme;
    export let __;

    let preview;
    let width = 400;
    let height = 450;
    let padding = 10;
    let scale = 1;
    let header = 'full';

    const headerOptions = [
        {
            value: 'full',
            label: 'full'
        },
        {
            value: 'plain',
            label: 'just chart'
        }
    ];

    function onChange() {
        preview.set({
            border: padding,
            width,
            height,
            scale,
            src: `/preview/${$chart.id}?${header === 'plain' ? 'plain=1' : ''}`
        });
    }
    function onReset() {
        preview.reset();
    }
</script>

<div class="section pl-0 pt-0">
    <h3 id="preview" class="title is-3">ChartIframePreviewDisplay</h3>
    <div class="columns">
        <div class="column is-two-thirds">
            <ChartPreviewIframeDisplay bind:this={preview} {chart} {theme} />
        </div>

        <div class="column">
            <FormFieldDisplay {__} label="Size">
                <div class="level">
                    width: <input
                        type="number"
                        class="input ml-1 mr-3"
                        min="100"
                        max="600"
                        step="10"
                        bind:value={width}
                    />
                    height:
                    <input
                        type="number ml-1"
                        class="input"
                        min="100"
                        max="600"
                        step="10"
                        bind:value={height}
                    />
                </div>
            </FormFieldDisplay>
            <FormFieldDisplay {__} label="Padding">
                <input type="range" min="0" max="40" bind:value={padding} />
                {padding}
            </FormFieldDisplay>
            <FormFieldDisplay {__} label="Scale">
                <input type="range" min="1" max="4" step="0.1" bind:value={scale} />
                {scale}x
            </FormFieldDisplay>
            <FormFieldDisplay {__} label="Header">
                <RadioInput bind:value={header} options={headerOptions} />
            </FormFieldDisplay>

            <button class="button" on:click={onChange}>set</button>
            <button class="button" on:click={onReset}>reset</button>
        </div>
    </div>
</div>
