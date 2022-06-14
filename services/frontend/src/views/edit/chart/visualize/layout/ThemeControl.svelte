<script>
    import HorizontalFormFieldDisplay from '_partials/displays/HorizontalFormFieldDisplay.svelte';
    import SelectInput from '_partials/controls/SelectInput.svelte';
    import httpReq from '@datawrapper/shared/httpReq';

    export let __;
    export let chart;
    export let theme;
    export let themes;

    $: themeOptions = themes
        .map(theme => ({ value: theme.id, label: theme.title }))
        .sort((a, b) => (a.label > b.label ? 1 : -1));

    async function onThemeChange(event) {
        // load new theme data from API
        $theme = await httpReq.get(`/v3/themes/${event.detail}`);
    }
</script>

<HorizontalFormFieldDisplay label={__('layout / theme')} compact>
    <SelectInput options={themeOptions} bind:value={$chart.theme} on:select={onThemeChange} />
</HorizontalFormFieldDisplay>
