<script>
    import SwitchControl from '_partials/controls/SwitchControl.svelte';
    import { getContext } from 'svelte';

    const { chart } = getContext('page/edit');

    export let __;
</script>

<SwitchControl bind:value={$chart.metadata.publish.blocks.embed} label={__('layout / embed')} />
