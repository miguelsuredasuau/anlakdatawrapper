<script>
    import Svelte2ChartControls from './Svelte2ChartControls.svelte';
    import ChartDescription from './ChartDescription.svelte';

    export let __;
    export let chart;
    export let dwChart;
    export let theme;
    export let visualization;
    export let visualizations;
    export let subscribeChart;
    export let teamSettings;
    export let disabledFields;
</script>

<div class="block">
    <ChartDescription {chart} {teamSettings} {disabledFields} {__} />
</div>
<Svelte2ChartControls
    controlsModule="Annotate"
    {chart}
    {dwChart}
    {theme}
    {visualization}
    {visualizations}
    {subscribeChart}
    {teamSettings}
/>
