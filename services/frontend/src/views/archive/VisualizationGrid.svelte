<script>
    import VisualizationBox from './VisualizationBox.svelte';
    export let charts;
    export let __;
</script>

<div class="columns is-multiline is-mobile">
    {#each charts as chart}
        <div
            class="column is-one-third-fullhd is-one-quarter-desktop is-one-third-tablet is-half-mobile"
        >
            <VisualizationBox {__} sortField="published_at" {chart} />
        </div>
    {/each}
</div>
