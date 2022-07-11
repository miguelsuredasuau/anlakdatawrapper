<script>
    import Svelte2ChartControls from './Svelte2ChartControls.svelte';

    export let __;
    export let dwChart;
    export let teamSettings;
</script>

<Svelte2ChartControls controlsModule="Refine" {dwChart} {teamSettings} {__} />
