<script>
    import NumberInput from '../NumberInput.svelte';

    export let value;
</script>

<style>
    .fixed-width {
        display: inline-block;
        width: 180px;
        background: aliceblue;
        border: 1px solid lightsteelblue;
        padding: 5px;
    }
</style>

<NumberInput min="0" max="100" bind:value />
<NumberInput unit="px" min="0" max="100" bind:value />
<NumberInput unit="°" min="0" max="100" bind:value />
<NumberInput unit="thousands of kilometers" min="0" max="100" bind:value />
<NumberInput min="0" max="100" step="0.1" bind:value />
<NumberInput min="0" max="100" step="10" bind:value />
<NumberInput min="0" max="200" bind:value />
<NumberInput min="0" max="200" width="80px" bind:value />
<NumberInput multiply="5" min="0" max="100" bind:value />
<NumberInput min="0" max="100" placeholder="auto" bind:value />
<NumberInput disabled={true} min="0" max="100" bind:value />
<hr />
<i>It can be used inline</i>
<NumberInput slider={false} min="0" max="100" bind:value />
<b>with other controls.</b>
<hr />
Inline <NumberInput min="0" max="100" bind:value /> with slider!
<hr />
In a fixed width container
<div class="fixed-width">
    <NumberInput min="0" max="200" bind:value />
</div>
<hr />
In a fixed width container
<div class="fixed-width">
    <NumberInput min="0" max="200" unit="with unit" bind:value />
</div>

<hr />
<code>
    <b>Current value:</b>
    {value}
</code>
