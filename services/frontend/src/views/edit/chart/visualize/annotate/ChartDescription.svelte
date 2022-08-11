<script>
    import { getContext } from 'svelte';
    import { isAllowedSourceUrl } from '@datawrapper/shared/validation';
    import get from '@datawrapper/shared/get';
    import purifyHtml from '@datawrapper/shared/purifyHtml';
    import HorizontalFormFieldDisplay from '_partials/displays/HorizontalFormFieldDisplay.svelte';
    import FormFieldDisplay from '_partials/displays/FormFieldDisplay.svelte';
    import TextInput from '_partials/controls/TextInput.svelte';
    import TextAreaInput from '_partials/controls/TextAreaInput.svelte';
    import CheckboxInput from '_partials/controls/CheckboxInput.svelte';
    import RadioInput from '_partials/controls/RadioInput.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    const { locale } = getContext('page/edit');

    export let __;
    export let chart;
    export let teamSettings;
    export let disabledFields = new Set();

    $: textDirection = $locale.textDirection;

    let sourceUrlError;
    $: {
        sourceUrlError = null;
        const sourceUrl = get($chart, 'metadata.describe.source-url');
        if (sourceUrl && !isAllowedSourceUrl(sourceUrl)) {
            sourceUrlError = __('visualize / annotate / source-url / not-allowed');
        }
    }
</script>

<style lang="scss">
    @import '../../../../../styles/export.scss';
    .chart-title {
        position: relative;
    }
    .chart-title :global(.checkbox) {
        opacity: 0.5;
        display: block;
        position: absolute;
        right: 0;
        top: 0;
        font-size: $size-small;
    }
    .chart-title :global(.checkbox:hover) {
        opacity: 1;
    }
</style>

<div class="block">
    <div class="field chart-title">
        <CheckboxInput
            label={__('annotate / hide-title')}
            bind:value={$chart.metadata.describe['hide-title']}
        />

        <FormFieldDisplay disabled={disabledFields.has('title')} compact label={__('Title')}>
            <TextInput
                disabled={disabledFields.has('title')}
                bind:value={$chart.title}
                expandable
                uid="annotate-chart-title"
                {textDirection}
            />
        </FormFieldDisplay>
    </div>

    <FormFieldDisplay compact label={__('Description')}>
        <TextAreaInput
            disabled={disabledFields.has('metadata.describe.intro')}
            bind:value={$chart.metadata.describe.intro}
            resize="vertical"
            {textDirection}
        />
    </FormFieldDisplay>

    <FormFieldDisplay compact label={__('Notes')}>
        <TextInput
            disabled={disabledFields.has('metadata.annotate.notes')}
            bind:value={$chart.metadata.annotate.notes}
            expandable
            {textDirection}
        />
    </FormFieldDisplay>

    <div class="columns">
        <div class="column is-half pb-0">
            <FormFieldDisplay compact label={__('Source name')}>
                <TextInput
                    bind:value={$chart.metadata.describe['source-name']}
                    disabled={disabledFields.has('metadata.describe.source-name')}
                    autocomplete="off"
                    expandable
                    placeholder={__('name of the organisation')}
                    {textDirection}
                />
            </FormFieldDisplay>
        </div>
        <div class="column is-half pb-0">
            <FormFieldDisplay compact label={__('Source URL')} error={sourceUrlError}>
                <TextInput
                    bind:value={$chart.metadata.describe['source-url']}
                    disabled={disabledFields.has('metadata.describe.source-url')}
                    placeholder={__('URL of the dataset')}
                    error={!!sourceUrlError}
                    {textDirection}
                />
            </FormFieldDisplay>
        </div>
    </div>
    {#if get(teamSettings, 'flags.byline', true)}
        <FormFieldDisplay compact label={__('visualize / annotate / byline')}>
            <TextInput
                bind:value={$chart.metadata.describe.byline}
                expandable
                disabled={disabledFields.has('metadata.describe.byline')}
                placeholder={__('visualize / annotate / byline / placeholder')}
                {textDirection}
            />
        </FormFieldDisplay>
    {/if}

    <FormFieldDisplay
        tooltip={__('visualize / annotate / aria-description / help')}
        compact
        label={__('visualize / annotate / aria-description')}
    >
        <TextAreaInput
            bind:value={$chart.metadata.describe['aria-description']}
            disabled={disabledFields.has('metadata.describe.aria-description')}
            placeholder={__('visualize / annotate / aria-description / placeholder')}
            resize="vertical"
            {textDirection}
        />
        <span slot="labelExtra" class="has-text-grey ml-1">
            <IconDisplay icon="accessibility" valign="middle" />
        </span>
    </FormFieldDisplay>
</div>

{#if get(teamSettings, 'customFields', []).length}
    <div class="block">
        <h4 class="title is-4 mb-3">Custom fields</h4>
        {#each teamSettings.customFields as field}
            {#if field.type == 'checkbox'}
                <HorizontalFormFieldDisplay
                    labelPadding="off"
                    compact
                    tooltip={purifyHtml(field.description)}
                >
                    <CheckboxInput
                        label={purifyHtml(field.title)}
                        bind:value={$chart.metadata.custom[field.key]}
                        disabled={disabledFields.has(`metadata.custom.${field.key}`)}
                    />
                </HorizontalFormFieldDisplay>
            {:else}
                <HorizontalFormFieldDisplay
                    compact
                    label={purifyHtml(field.title)}
                    tooltip={purifyHtml(field.description)}
                >
                    {#if field.type == 'text'}
                        <TextInput
                            bind:value={$chart.metadata.custom[field.key]}
                            disabled={disabledFields.has(`metadata.custom.${field.key}`)}
                            {textDirection}
                        />
                    {:else if field.type == 'textArea'}
                        <TextAreaInput
                            bind:value={$chart.metadata.custom[field.key]}
                            disabled={disabledFields.has(`metadata.custom.${field.key}`)}
                            {textDirection}
                        />
                    {:else if field.type == 'radio'}
                        <RadioInput
                            options={field.items
                                .split('\n')
                                .filter(d => d.trim())
                                .map(value => ({ value, label: value }))}
                            bind:value={$chart.metadata.custom[field.key]}
                            disabled={disabledFields.has(`metadata.custom.${field.key}`)}
                            {textDirection}
                        />
                    {/if}
                </HorizontalFormFieldDisplay>
            {/if}
        {/each}
    </div>
{/if}
