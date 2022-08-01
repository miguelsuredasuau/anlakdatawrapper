<script type="text/javascript">
    import WebComponentEmbed from './WebComponentEmbed.svelte';
    export let chartIds = [];
    let groupedCharts = [];
    $: {
        groupedCharts = chartIds.reduce(
            (acc, cur) => {
                const group = acc[acc.length - 1];
                group.push(cur);
                if (group.length === 2) acc.push([]);
                return acc;
            },
            [[]]
        );
    }
</script>

<section class="section">
    <div class="container">
        <div class="columns">
            <div class="column">
                <p>
                    Provide a list of comma-separated chart IDs to test them as web component
                    embeds:
                </p>
                <form action="/v2/web-components" method="GET">
                    <input name="charts" class="input" value={chartIds} />
                    <input type="submit" value="Go" />
                </form>
            </div>
        </div>

        <hr />

        {#each groupedCharts as charts}
            <div class="columns">
                {#each charts as chart}
                    <div class="column">
                        <WebComponentEmbed id={chart} />
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</section>
