<script>
    import Svelte2ChartControls from './Svelte2ChartControls.svelte';
    import { onMount, getContext } from 'svelte';

    const { chart } = getContext('page/edit');

    export let __;
    export let dwChart;
    export let teamSettings;

    onMount(() => {
        // remember that user has opened refine tab once
        $chart.metadata.visualize['chart-type-set'] = true;
    });
</script>

<Svelte2ChartControls controlsModule="Refine" {dwChart} {teamSettings} {__} />
