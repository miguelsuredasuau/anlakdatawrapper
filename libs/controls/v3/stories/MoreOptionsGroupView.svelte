<script>
    // import ListInput from '../ListInput.html'; // TODO Uncomment as soon as v3 ListInput exists.
    import MoreOptionsGroup from '../MoreOptionsGroup.svelte';
    import CheckboxControl from '../CheckboxControl.svelte';
    // import RadioControl from '../RadioControl.html'; // TODO Uncomment as soon as v3 RadioControl exists.
    import SwitchControl from '../SwitchControl.svelte';

    // export let items; // TODO: Uncomment as soon as v3 ListInput is used.

    // const radioItems = items.slice(0, 3); // TODO: Uncomment as soon as v3 RadioControl is used.
    const selected = ['blue']; // TODO: Turn into `let` as soon as v3 RadioControl is used.
</script>

<style>
    h3 {
        margin-top: 2em;
    }
    h3:first-child {
        margin-top: 0;
    }
</style>

<h3>Simple example</h3>
<p>Before</p>
<MoreOptionsGroup>
    <CheckboxControl label="Now there is a lot of..." />
    <CheckboxControl label="...extra space for..." />
    <CheckboxControl label="...advanced features" />
</MoreOptionsGroup>

<h3>With optional bottom line</h3>
<p>Here is the same example</p>
<MoreOptionsGroup bottomLine={true}>
    <CheckboxControl label="Now there is a lot of..." />
    <CheckboxControl label="...extra space for..." />
    <CheckboxControl label="...advanced features" />
</MoreOptionsGroup>
<CheckboxControl label="I come after" />

<h3>More options in a switch</h3>

<SwitchControl value={true} label="More options inside a Switch">
    <CheckboxControl label="I am a very important checkbox" />
    <MoreOptionsGroup>
        <CheckboxControl label="Now there is a lot of..." />
        <CheckboxControl label="...extra space for..." />
        <CheckboxControl label="...advanced features" />
    </MoreOptionsGroup>
</SwitchControl>

<h3>More options in a box</h3>
<p>Select item for options</p>
<!--
TODO Uncomment as soon as v3 ListInput exists.
<ListInput {items} bind:selected maxHeight="130px" />
-->
{#if selected.length}
    <div class="well">
        <!--
    TODO Uncomment as soon as v3 RadioControl exists.
    <RadioControl label="Options" labelWidth="80px" options={radioItems}></RadioControl>
    <RadioControl label="Options" labelWidth="80px" options={radioItems}></RadioControl>
    <RadioControl label="Options" labelWidth="80px" options={radioItems}></RadioControl>
    -->

        <MoreOptionsGroup>
            <!--
        TODO Uncomment as soon as v3 RadioControl exists.
        <RadioControl label="More" labelWidth="80px" options={radioItems}></RadioControl>
        -->
            <CheckboxControl label="Now there is a lot of..." />
            <CheckboxControl label="...extra space for..." />
            <CheckboxControl label="...advanced features" />
        </MoreOptionsGroup>
    </div>
{/if}

<h3>Disabled state</h3>
<MoreOptionsGroup disabled={true}>
    <CheckboxControl label="Now there is a lot of..." />
    <CheckboxControl label="...extra space for..." />
    <CheckboxControl label="...advanced features" />
</MoreOptionsGroup>
