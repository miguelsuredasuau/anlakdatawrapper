<script>
    import Svelte2ChartControls from './Svelte2ChartControls.svelte';

    export let __;
    export let dwChart;
    export let visualizations;
    export let teamSettings;
</script>

<Svelte2ChartControls controlsModule="Refine" {dwChart} {visualizations} {teamSettings} {__} />
