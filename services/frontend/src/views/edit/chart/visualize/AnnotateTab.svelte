<script>
    import Svelte2ChartControls from './Svelte2ChartControls.svelte';
    import ChartDescription from './annotate/ChartDescription.svelte';
    import { getContext } from 'svelte';
    // load stores from context
    const { chart } = getContext('page/edit');

    export let __;
    export let dwChart;
    export let teamSettings;
</script>

<div class="block">
    <ChartDescription {chart} {teamSettings} {__} />
</div>
<Svelte2ChartControls controlsModule="Annotate" {dwChart} {teamSettings} {__} />
