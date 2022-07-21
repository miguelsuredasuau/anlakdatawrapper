<script>
    import SwitchControl from '_partials/controls/SwitchControl.svelte';
    import { getContext } from 'svelte';

    const { chart } = getContext('page/edit');
    export let __;

    const getTheData = chart.bindKey('metadata.publish.blocks.get-the-data');
</script>

<SwitchControl bind:value={$getTheData} label={__('layout / get-the-data')} />
