<script>
    import Svelte2ChartControls from './Svelte2ChartControls.svelte';

    export let chart;
    export let dwChart;
    export let theme;
    export let visualization;
    export let visualizations;
    export let subscribeChart;
    export let teamSettings;
</script>

<Svelte2ChartControls
    controlsModule="Refine"
    {chart}
    {dwChart}
    theme={$theme}
    {visualization}
    {visualizations}
    {subscribeChart}
    {teamSettings}
/>
