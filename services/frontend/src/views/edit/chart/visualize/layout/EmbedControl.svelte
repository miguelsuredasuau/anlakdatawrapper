<script>
    import SwitchControl from '_partials/controls/SwitchControl.svelte';

    export let __;
    export let chart;
</script>

<SwitchControl bind:value={$chart.metadata.publish.blocks.embed} label={__('layout / embed')} />
