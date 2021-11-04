<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    import { beforeUpdate } from 'svelte';
    import VisualizationGrid from './VisualizationGrid.svelte';
    import httpReq from '@datawrapper/shared/httpReq';

    export let __;

    export let folderId;
    export let teamId;
    export let charts;

    export let offset = 0;
    export let limit;
    $: total = charts.total;

    let _offset = offset;
    beforeUpdate(async () => {
        if (_offset !== offset) {
            _offset = offset;
            charts = await httpReq.get(
                `/v3/charts?offset=${offset}&limit=${limit}&folderId=${
                    folderId ? folderId : 'null'
                }${teamId ? `&teamId=${teamId}` : ''}`
            );
        }
    });
</script>

<style>
    .section {
        padding: 2rem 3rem;
    }
</style>

<MainLayout title="Archive">
    <section class="section header">
        <div class="container">
            <h1 class="title">Visualization Archive</h1>
        </div>
    </section>
    <section class="section body">
        <div class="container">
            <div class="columns">
                <div class="column is-one-quarter">Folder Nav</div>
                <div class="column">
                    <VisualizationGrid {__} bind:offset {limit} {total} charts={charts.list} />
                </div>
            </div>
        </div>
    </section>
</MainLayout>
