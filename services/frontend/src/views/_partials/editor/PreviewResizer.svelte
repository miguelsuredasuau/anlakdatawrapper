<script>
    import ToolbarItem from './ToolbarItem.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import NumberInput from '_partials/controls/NumberInput.svelte';
    import RadioInput from '_partials/controls/RadioInput.svelte';
    import SelectInput from '_partials/controls/SelectInput.svelte';
    import get from '@datawrapper/shared/get';
    import round from '@datawrapper/shared/round';

    import { onMount, getContext, tick } from 'svelte';
    const { chart, team, theme, visualization } = getContext('page/edit');

    $: uiMode =
        get($chart, 'metadata.custom.webToPrint.mode', 'web') === 'print' ||
        get($theme, 'data.type', 'web') === 'print'
            ? 'print'
            : 'web';

    function setWidth(widthInPixel) {
        $chart.metadata.publish['embed-width'] = widthInPixel;
    }

    $: widthInPixel = $chart.metadata.publish['embed-width'];

    const DEFAULT_WIDTHS = [320, 400, 600];
    $: breakpointWidths = Array.isArray($team.settings.previewWidths)
        ? $team.settings.previewWidths.map((width, i) => width || DEFAULT_WIDTHS[i])
        : DEFAULT_WIDTHS;

    const sizeIcons = ['mobile', 'tablet', 'desktop'];

    $: breakpoints = breakpointWidths
        .sort((a, b) => a - b)
        .map((width, i) => ({
            icon: sizeIcons[i],
            width,
            minWidth: i ? breakpointWidths[i - 1] + 1 : 0,
            maxWidth: i < breakpointWidths.length - 1 ? breakpointWidths[i] : Infinity
        }));

    let printExpanded = false;

    export let __;
    export let uid = null;

    const UNITS = [
        { value: 'mm', label: 'mm', step: 1, decimals: 0 },
        { value: 'in', label: 'in', step: 0.01, decimals: 2 },
        { value: 'px', label: 'px', step: 1, decimals: 0 }
    ];

    let unit = 'mm';
    let prevUnit = 'mm';
    $: unitObj = UNITS.find(u => u.value === unit);

    let printWidth;
    let printHeight;

    $: printPresetsOptions = get($theme, 'data.export.pdf.presets', []).map(preset => ({
        value: preset,
        label: preset.title
    }));
    let selectedPrintPreset = null;

    async function onSelectPrintPreset(event) {
        const preset = event.detail;
        unit = preset.unit;
        await tick(); // so that factor and dimensions update
        if (preset.width) printWidth = preset.width;
        if (preset.height) printHeight = preset.height;
        updateEmbedSize();
        selectedPrintPreset = null;
    }

    const DPI = 96;
    const IN2MM = 25.4;
    $: factor = unit === 'px' ? 1 : unit === 'mm' ? IN2MM / DPI : 1 / DPI;
    $: printScale = get($theme, 'data.export.pdf.scale', 1);

    $: isFixedHeight = $visualization.height === 'fixed';

    function updatePrintDimensions() {
        printWidth = round(
            $chart.metadata.publish['embed-width'] * factor * printScale,
            unitObj.decimals
        );
        printHeight = round(
            $chart.metadata.publish['embed-height'] * factor * printScale,
            unitObj.decimals
        );
    }

    function updateEmbedSize() {
        $chart.metadata.publish['embed-width'] = Math.round(printWidth / factor / printScale);
        $chart.metadata.publish['embed-height'] = Math.round(printHeight / factor / printScale);
    }

    onMount(() => {
        updatePrintDimensions();
        // update print dimensions whenever the embed size changes
        chart.subscribeKey('metadata.publish.embed-width', updatePrintDimensions);
        chart.subscribeKey('metadata.publish.embed-height', updatePrintDimensions);
    });

    $: {
        // update print dimensions whenever the unit changes
        if (unit !== prevUnit) {
            updatePrintDimensions();
            prevUnit = unit;
        }
    }
</script>

<style lang="scss">
    @import '../../../styles/export.scss';
    .print-options {
        border-top: 1px solid $border;
    }
    .size-presets {
        :global(.icon) {
            font-size: 1.15em;
        }
        :global(.icon.mobile) {
            font-size: 0.75em;
        }
        :global(.icon.desktop) {
            font-size: 1.4em;
        }
    }
</style>

<ToolbarItem title={`${__('chart-size')} (${uiMode === 'web' ? 'px' : unit})`} {uid}>
    {#if uiMode === 'web' || unit === 'px'}
        <!-- web ui -->
        <div class="field is-grouped">
            <div class="control">
                <NumberInput
                    class="is-small"
                    width="8ex"
                    bind:value={$chart.metadata.publish['embed-width']}
                />
            </div>
            <div class="control">
                {#if isFixedHeight}
                    <input
                        class="input is-small"
                        type="text"
                        style="width:8ex"
                        disabled
                        value="auto"
                    />
                {:else}
                    <NumberInput
                        class="is-small"
                        width="8ex"
                        bind:value={$chart.metadata.publish['embed-height']}
                    />
                {/if}
            </div>
        </div>
    {:else}
        <!-- print ui -->
        <div class="field is-grouped">
            <div class="control">
                <NumberInput
                    class="is-small"
                    width="8ex"
                    bind:value={printWidth}
                    on:change={updateEmbedSize}
                />
            </div>
            <div class="control">
                <NumberInput
                    class="is-small"
                    width="8ex"
                    bind:value={printHeight}
                    on:change={updateEmbedSize}
                />
            </div>
        </div>
    {/if}
    {#if uiMode === 'web'}
        <div class="field has-addons size-presets">
            {#each breakpoints as preset, i}
                <div class="control">
                    <button
                        class="button is-small is-outlined is-dark"
                        class:is-selected={widthInPixel >= preset.minWidth &&
                            widthInPixel <= preset.maxWidth}
                        on:click={() => setWidth(preset.width)}
                        ><IconDisplay icon={preset.icon} className={preset.icon} /></button
                    >
                </div>
            {/each}
        </div>
    {:else}
        <!-- print component with "footer" for preview purpose -->
        <div class="field">
            <div class="control">
                <button
                    class="button is-small is-outlined is-dark"
                    on:click={() => (printExpanded = !printExpanded)}
                    ><IconDisplay
                        icon="expand-{printExpanded ? 'up' : 'down'}-bold"
                        size="0.75em"
                    /></button
                >
            </div>
        </div>
    {/if}
    <svelte:fragment slot="footer">
        {#if printExpanded}
            <div class="print-options mt-2 pt-2">
                <RadioInput options={UNITS} bind:value={unit} />
                {#if printPresetsOptions.length > 0}
                    <SelectInput
                        class="is-small mt-2"
                        placeholder={__('apply-preset')}
                        bind:value={selectedPrintPreset}
                        on:select={onSelectPrintPreset}
                        options={printPresetsOptions}
                    />
                {/if}
            </div>{/if}
    </svelte:fragment>
</ToolbarItem>
