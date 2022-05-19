<script>
    import { chart, visualization } from '../../stores';

    export let visualizations;

    function setVisualization(vis) {
        $chart.type = vis.id;
        $chart = $chart;
    }
</script>

SELECT VISUALIZATION TYPE HERE (current: {$visualization.id});

<ul>
    {#each visualizations as vis}
        <li>
            <button class="button is-text" on:click={() => setVisualization(vis)}>{vis.id}</button>
        </li>
    {/each}
</ul>
