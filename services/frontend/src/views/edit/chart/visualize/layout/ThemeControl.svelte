<script>
    import HorizontalFormFieldDisplay from '_partials/displays/HorizontalFormFieldDisplay.svelte';
    import SelectInput from '_partials/controls/SelectInput.svelte';

    export let __;
    export let chart;
    export let themes;

    $: themeOptions = themes
        .map(theme => ({ value: theme.id, label: theme.title }))
        .sort((a, b) => (a.label > b.label ? 1 : -1));
</script>

<HorizontalFormFieldDisplay label={__('layout / theme')} compact>
    <SelectInput options={themeOptions} bind:value={$chart.theme} />
</HorizontalFormFieldDisplay>
