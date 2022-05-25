<script>
    import Svelte2ChartControls from './Svelte2ChartControls.svelte';

    export let chart;
    export let dwChart;
    export let theme;
    export let visualization;
    export let visualizations;
    export let subscribeChart;
    export let teamSettingsControls;
</script>

<div class="block">
    Title: <input type="text" class="input" bind:value={$chart.title} />
    Description:
    <input type="text" class="input" bind:value={$chart.metadata.describe.intro} />
    <hr />
</div>
<Svelte2ChartControls
    controlsModule="Annotate"
    {chart}
    {dwChart}
    {theme}
    {visualization}
    {visualizations}
    {subscribeChart}
    {teamSettingsControls}
/>
