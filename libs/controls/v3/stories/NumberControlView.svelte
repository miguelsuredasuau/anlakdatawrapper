<script>
    import NumberControl from '../NumberControl.svelte';

    export let value;
</script>

<NumberControl labelWidth="60px" label="default" min="0" max="100" bind:value />
<NumberControl labelWidth="60px" label="with unit" unit="px" min="0" max="100" bind:value />
<NumberControl labelWidth="60px" label="with tiny unit" unit="°" min="0" max="100" bind:value />
<NumberControl
    labelWidth="60px"
    label="with very long unit"
    unit="miles per gallon"
    min="0"
    max="100"
    bind:value
/>
<NumberControl
    labelWidth="60px"
    label="with help and unit"
    unit="px"
    help="Here you can get some help"
    min="0"
    max="100"
    bind:value
/>
<NumberControl
    labelWidth="80px"
    label="with help"
    help="Here you can get some help"
    min="0"
    max="100"
    bind:value
/>
<NumberControl labelWidth="80px" label="steps of 0.1" min="0" max="100" step="0.1" bind:value />
<NumberControl labelWidth="80px" label="steps of 10" min="0" max="100" step="10" bind:value />
<NumberControl labelWidth="80px" label="range 0...200" min="0" max="200" bind:value />
<NumberControl labelWidth="80px" label="multiply by 5" multiply="5" min="0" max="100" bind:value />
<NumberControl
    labelWidth="80px"
    label="placeholder"
    min="0"
    max="100"
    placeholder="auto"
    bind:value
/>
<NumberControl disabled={true} labelWidth="80px" label="disabled" min="0" max="100" bind:value />
<NumberControl labelWidth="80px" label="no slider" slider={false} min="0" max="100" bind:value />
<NumberControl
    labelWidth="80px"
    label="no slider with placeholder"
    slider={false}
    min="0"
    max="100"
    placeholder="auto"
/>
