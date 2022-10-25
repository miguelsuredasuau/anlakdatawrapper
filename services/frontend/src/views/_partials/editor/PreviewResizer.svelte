<script>
    import ToolbarItem from './ToolbarItem.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import NumberInput from '_partials/controls/NumberInput.svelte';
    import RadioInput from '_partials/controls/RadioInput.svelte';
    import SelectInput from '_partials/controls/SelectInput.svelte';
    import get from '@datawrapper/shared/get.js';
    import { waitFor } from '../../../utils';

    import { onMount, getContext, createEventDispatcher } from 'svelte';
    import { UNIT_IN, UNIT_MM, UNIT_PX, unitToPx, pxToUnit } from '@datawrapper/shared/units.js';
    import { merge } from 'rxjs';
    import { debounceTime, map, distinctUntilChanged } from 'rxjs/operators';

    const { chart, team, theme, editorMode, isFixedHeight } = getContext('page/edit');

    const dispatch = createEventDispatcher();

    export let __;
    export let uid = null;
    export let iframePreview;

    export let hideInputs = false;

    const DEFAULT_WIDTHS = [320, 400, 600];
    const SIZE_ICONS = ['mobile', 'tablet', 'desktop'];

    const UNITS = {
        [UNIT_MM]: { step: 1, decimals: 0 },
        [UNIT_IN]: { step: 0.01, decimals: 2 },
        [UNIT_PX]: { step: 1, decimals: 0 }
    };

    $: unit = get($chart, 'metadata.publish.export-pdf.unit', UNIT_MM);
    $: curUnit = UNITS[unit] || UNITS[UNIT_MM];

    const unitObs = chart.bindKey('metadata.publish.export-pdf.unit');

    let widthPx;
    let heightPx;

    let printExpanded = false;
    let selectedPrintPreset = null;

    $: printPresets = get($theme, 'data.export.pdf.presets', []);
    $: printPresetsOptions = printPresets.map(preset => ({
        value: preset,
        label: preset.title
    }));

    const printScale = theme.pipe(
        map(theme => get(theme, 'data.export.pdf.scale', 1)),
        distinctUntilChanged()
    );
    const embedWidth = chart.bindKey('metadata.publish.embed-width');
    const embedHeight = chart.bindKey('metadata.publish.embed-height');
    const exportPdfSettings = chart.bindKey('metadata.publish.export-pdf', {});
    const updatePreviewStream = merge(
        isFixedHeight,
        embedWidth,
        embedHeight,
        exportPdfSettings,
        editorMode,
        printScale
    ).pipe(debounceTime(20));

    $: if ($updatePreviewStream) updatePreview();

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

    $: if ($editorMode === 'print') setInitialPrintProps($theme);

    const IGNORE_PRESET_KEYS = new Set(['unit', 'width', 'height', 'title', 'default']);

    function handlePresetSelect(event) {
        const preset = event.detail;
        const prevExportPdf = $exportPdfSettings;
        const unit = preset.unit || UNIT_MM;
        $exportPdfSettings = {
            ...prevExportPdf,
            unit,
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

    function handleUnitChange(event) {
        const unit = event.target.value;
        const prevExportPdf = $exportPdfSettings;
        $exportPdfSettings = {
            ...prevExportPdf,
            unit,
            width: printSizeFromPxSize(unit, widthPx),
            height: printSizeFromPxSize(unit, heightPx)
        };
    }

    async function updatePreview() {
        if (typeof window === 'undefined') {
            // don't update preview in ssr
            return;
        }
        [widthPx, heightPx] = getPixelDimensions();
        try {
            await waitFor(() => iframePreview);
            iframePreview.set({
                width: widthPx,
                height: $isFixedHeight ? null : heightPx
            });
        } catch (er) {
            // do nothing
        }
    }

    function saveNewFixedHeight(height) {
        if ($editorMode === 'web') {
            $chart.metadata.publish['embed-height'] = height;
        }
        if ($editorMode === 'print') {
            $chart.metadata.publish['export-pdf'].height = printSizeFromPxSize(unit, height);
        }
    }

    function setInitialPrintProps(theme) {
        const pdfMeta = get($chart, 'metadata.publish.export-pdf', {});
        const embedWidth = $chart.metadata.publish['embed-width'];
        const embedHeight = $chart.metadata.publish['embed-height'];
        const defaultPreset = get(theme, 'data.export.pdf.presets', []).find(d => d.default) || {};

        const newUnit = pdfMeta.unit || defaultPreset.unit || UNIT_MM;

        const legacyDefaultSize = {
            mm: [80, 120],
            in: [80, 120].map(size =>
                printSizeFromPxSize(UNIT_IN, pxSizeFromPrintSize(UNIT_MM, size))
            ),
            px: [80, 120].map(size => pxSizeFromPrintSize(UNIT_MM, size))
        };

        const fallbackWidth =
            $editorMode === 'web'
                ? printSizeFromPxSize(newUnit, embedWidth) /* print theme */
                : legacyDefaultSize[newUnit][0];

        const fallbackHeight =
            $editorMode === 'web'
                ? printSizeFromPxSize(newUnit, embedHeight)
                : legacyDefaultSize[newUnit][1];

        const prevExportPdf = $exportPdfSettings;
        $exportPdfSettings = {
            ...prevExportPdf,
            unit: newUnit,
            width: pdfMeta.width || defaultPreset.width || fallbackWidth,
            height: pdfMeta.height || defaultPreset.height || fallbackHeight
        };
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
        dispatch('setEmbedWidth', { width });
        $embedWidth = width;
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

<ToolbarItem title={`${__('chart-size')} (${$editorMode === 'web' ? UNIT_PX : $unitObs})`} {uid}>
    {#if $editorMode === 'web'}
        <!-- web ui -->
        {#if !hideInputs}
            <div class="field is-grouped">
                <div class="control">
                    <NumberInput
                        uid="web-width"
                        class="is-small"
                        width="10ex"
                        spinner="true"
                        bind:value={$chart.metadata.publish['embed-width']}
                    />
                </div>
                <div class="control">
                    {#if $isFixedHeight}
                        <NumberInput class="is-small" disabled value="auto" width="8ex" />
                    {:else}
                        <NumberInput
                            uid="web-height"
                            class="is-small"
                            spinner="true"
                            width="10ex"
                            bind:value={$chart.metadata.publish['embed-height']}
                        />
                    {/if}
                </div>
            </div>
        {/if}
    {:else}
        <!-- print ui -->
        <div class="field is-grouped">
            <div class="control">
                <NumberInput
                    uid="print-width"
                    class="is-small"
                    spinner="true"
                    width="10ex"
                    step={curUnit.step}
                    bind:value={$chart.metadata.publish['export-pdf'].width}
                />
            </div>
            <div class="control">
                {#if $isFixedHeight}
                    <NumberInput class="is-small" disabled value="auto" width="8ex" />
                {:else}
                    <NumberInput
                        uid="print-height"
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
                    on:change={handleUnitChange}
                    value={$chart.metadata.publish['export-pdf'].unit}
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
