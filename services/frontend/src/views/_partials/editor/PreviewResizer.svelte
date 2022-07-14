<script>
    import ToolbarItem from './ToolbarItem.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import NumberInput from '_partials/controls/NumberInput.svelte';
    import RadioInput from '_partials/controls/RadioInput.svelte';
    import SelectInput from '_partials/controls/SelectInput.svelte';
    import get from '@datawrapper/shared/get';
    import set from '@datawrapper/shared/set';
    import { waitFor } from '../../../utils';

    import { onMount, getContext } from 'svelte';
    import { UNIT_IN, UNIT_MM, UNIT_PX, unitToPx, pxToUnit } from '@datawrapper/shared/units';

    const { chart, team, theme, editorMode, isFixedHeight } = getContext('page/edit');

    $: webToPrintMode = get($chart, 'metadata.custom.webToPrint.mode', 'web');

    export let __;
    export let uid = null;
    export let iframePreview;

    const DEFAULT_WIDTHS = [320, 400, 600];
    const SIZE_ICONS = ['mobile', 'tablet', 'desktop'];

    const UNITS = {
        [UNIT_MM]: { step: 1, decimals: 0 },
        [UNIT_IN]: { step: 0.01, decimals: 2 },
        [UNIT_PX]: { step: 1, decimals: 0 }
    };

    $: unit = get($chart, 'metadata.publish.export-pdf.unit', UNIT_MM);
    $: curUnit = UNITS[unit] || UNITS[UNIT_MM];

    let widthPx;
    let heightPx;

    let printExpanded = false;
    let selectedPrintPreset = null;

    let previousPrintScale;

    $: printScale = get($theme, 'data.export.pdf.scale', 1);
    $: printPresets = get($theme, 'data.export.pdf.presets', []);
    $: printPresetsOptions = printPresets.map(preset => ({
        value: preset,
        label: preset.title
    }));

    $: if ($isFixedHeight) updatePreview();

    chart.subscribeKey('metadata.publish.embed-width', updatePreview);
    chart.subscribeKey('metadata.publish.embed-height', updatePreview);

    chart.subscribeKey('metadata.publish.export-pdf', exportPdf => {
        // check if the unit has changed
        if (exportPdf.unit) {
            // the unit has changed so we may need to compute converted size
            const prevExportPdf = $chart.metadata.publish['export-pdf'];
            set($chart, 'metadata.publish.export-pdf', {
                ...prevExportPdf,
                // update width and height
                width: exportPdf.width || printSizeFromPxSize(exportPdf.unit, widthPx),
                height: exportPdf.height || printSizeFromPxSize(exportPdf.unit, heightPx)
            });
            $chart = $chart;
            updatePreview();
        } else if (exportPdf.width || exportPdf.height) {
            // just the size has changed, which is bound directly
            // to $chart.metadata.publish.export-pdf, so no need
            // to convert any units
            updatePreview();
        }
    });

    $: breakpointWidths = Array.isArray($team.settings.previewWidths)
        ? $team.settings.previewWidths.map((width, i) => width || DEFAULT_WIDTHS[i])
        : DEFAULT_WIDTHS;

    $: breakpoints = breakpointWidths
        .sort((a, b) => a - b)
        .map((width, i) => ({
            icon: SIZE_ICONS[i],
            width,
            minWidth: i ? breakpointWidths[i - 1] + 1 : 0,
            maxWidth: i < breakpointWidths.length - 1 ? breakpointWidths[i] : Infinity
        }));

    $: if (iframePreview) {
        iframePreview.$on('fixed-height-changed', e => saveNewFixedHeight(e.detail));
    }

    editorMode.subscribe($editorMode => {
        if ($editorMode === 'print') {
            setInitialPrintProps();
        }
        updatePreview();
    });

    // update preview when print scale changes (when switching between themes)
    $: {
        if ($editorMode === 'print' && previousPrintScale !== printScale) {
            updatePreview();
        }
        previousPrintScale = printScale;
    }

    const IGNORE_PRESET_KEYS = new Set(['unit', 'width', 'height', 'title', 'default']);

    function handlePresetSelect(event) {
        const preset = event.detail;
        const prevExportPdf = $chart.metadata.publish['export-pdf'];
        $chart.metadata.publish['export-pdf'] = {
            ...prevExportPdf,
            unit: preset.unit || UNIT_MM,
            width: preset.width || printSizeFromPxSize(unit, widthPx),
            height: preset.height || printSizeFromPxSize(unit, heightPx),
            // include other keys, such as scale, colorMode etc.
            ...Object.fromEntries(
                Object.entries(preset).filter(([key]) => !IGNORE_PRESET_KEYS.has(key))
            )
        };
        // unselect preset
        selectedPrintPreset = null;
    }

    async function updatePreview() {
        [widthPx, heightPx] = getPixelDimensions();

        await waitFor(() => iframePreview);
        iframePreview.set({
            width: widthPx,
            height: $isFixedHeight ? null : heightPx
        });
    }

    function saveNewFixedHeight(height) {
        if ($editorMode === 'web') {
            $chart.metadata.publish['embed-height'] = height;
        }
        if ($editorMode === 'print') {
            $chart.metadata.publish['export-pdf'].height = printSizeFromPxSize(unit, height);
        }
    }

    function setInitialPrintProps() {
        const pdfMeta = get($chart, 'metadata.publish.export-pdf', {});
        const embedWidth = $chart.metadata.publish['embed-width'];
        const embedHeight = $chart.metadata.publish['embed-height'];
        const defaultPreset = get($theme, 'data.export.pdf.presets', []).find(d => d.default) || {};

        const newUnit = pdfMeta.unit || defaultPreset.unit || UNIT_MM;

        const legacyDefaultSize = {
            mm: [80, 120],
            in: [80, 120].map(size =>
                printSizeFromPxSize(UNIT_IN, pxSizeFromPrintSize(UNIT_MM, size))
            ),
            px: [80, 120].map(size => pxSizeFromPrintSize(UNIT_MM, size))
        };

        const fallbackWidth =
            webToPrintMode === 'web'
                ? printSizeFromPxSize(unit, embedWidth) /* print theme */
                : legacyDefaultSize[newUnit][0];

        const fallbackHeight =
            webToPrintMode === 'web'
                ? printSizeFromPxSize(unit, embedHeight)
                : legacyDefaultSize[newUnit][1];

        const prevExportPdf = $chart.metadata.publish['export-pdf'];
        set($chart, 'metadata.publish.export-pdf', {
            ...prevExportPdf,
            unit: newUnit,
            width: pdfMeta.width || defaultPreset.width || fallbackWidth,
            height: pdfMeta.height || defaultPreset.height || fallbackHeight
        });
    }

    function getPixelDimensions() {
        const printWidth = get($chart, 'metadata.publish.export-pdf.width');
        const printHeight = get($chart, 'metadata.publish.export-pdf.height');
        const unit = get($chart, 'metadata.publish.export-pdf.unit');
        return $editorMode === 'web'
            ? ['width', 'height'].map(s => $chart.metadata.publish[`embed-${s}`])
            : [printWidth, printHeight].map(s => pxSizeFromPrintSize(unit, s));
    }

    function printSizeFromPxSize(unit, size) {
        const decimals = (UNITS[unit] || UNITS[UNIT_MM]).decimals;
        const printScale = get($theme, 'data.export.pdf.scale', 1);
        return +pxToUnit(size * printScale, unit).toFixed(decimals);
    }

    function pxSizeFromPrintSize(unit, size) {
        const printScale = get($theme, 'data.export.pdf.scale', 1);
        return Math.round(unitToPx(size / printScale, unit));
    }

    function setEmbedWidth(width) {
        $chart.metadata.publish['embed-width'] = width;
        $chart = $chart;
    }

    onMount(() => {
        [widthPx, heightPx] = getPixelDimensions();
    });
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

<ToolbarItem title={`${__('chart-size')} (${$editorMode === 'web' ? UNIT_PX : unit})`} {uid}>
    {#if $editorMode === 'web'}
        <!-- web ui -->
        <div class="field is-grouped">
            <div class="control">
                <NumberInput
                    class="is-small"
                    width="10ex"
                    spinner="true"
                    bind:value={$chart.metadata.publish['embed-width']}
                />
            </div>
            <div class="control">
                {#if $isFixedHeight}
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
                        spinner="true"
                        width="10ex"
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
                    spinner="true"
                    width="10ex"
                    step={curUnit.step}
                    bind:value={$chart.metadata.publish['export-pdf'].width}
                />
            </div>
            <div class="control">
                {#if $isFixedHeight}
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
                        spinner="true"
                        width="10ex"
                        step={curUnit.step}
                        bind:value={$chart.metadata.publish['export-pdf'].height}
                    />
                {/if}
            </div>
        </div>
    {/if}
    {#if $editorMode === 'web'}
        <div class="field has-addons size-presets">
            {#each breakpoints as preset, i}
                <div class="control">
                    <button
                        class="button is-small is-outlined is-dark"
                        class:is-selected={$chart.metadata.publish['embed-width'] >=
                            preset.minWidth &&
                            $chart.metadata.publish['embed-width'] <= preset.maxWidth}
                        on:click={() => setEmbedWidth(preset.width)}
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
                <RadioInput
                    options={Object.entries(UNITS).map(([key]) => ({
                        value: key,
                        label: key
                    }))}
                    bind:value={$chart.metadata.publish['export-pdf'].unit}
                />
                {#if printPresetsOptions.length > 0}
                    <SelectInput
                        class="is-small mt-2"
                        placeholder={__('apply-preset')}
                        bind:value={selectedPrintPreset}
                        on:select={handlePresetSelect}
                        options={printPresetsOptions}
                    />
                {/if}
            </div>{/if}
    </svelte:fragment>
</ToolbarItem>
