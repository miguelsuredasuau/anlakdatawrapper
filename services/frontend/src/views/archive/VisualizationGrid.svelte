<script>
    import VisualizationBox from './VisualizationBox.svelte';
    import Pagination from '_partials/componentsnents/Pagination.svelte';
    export let charts;
    export let limit;
    export let offset;
    export let total;
    export let __;
</script>

<div class="columns is-multiline is-mobile">
    {#each charts as chart}
        <div class="column is-one-third-desktop is-half-tablet is-half-mobile">
            <VisualizationBox {__} sortField="published_at" {chart} />
        </div>
    {/each}
</div>
<Pagination {limit} bind:offset {total} />
