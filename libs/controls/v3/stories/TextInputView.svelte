<script>
    import TextInput from '../TextInput.svelte';

    export let value;
</script>

<label>TextInput control (expandable, short text)</label>
<TextInput bind:value expandable />
<hr />

<label>TextInput control (expandable, long text)</label>
<TextInput
    expandable
    value="This is some very, very long text that will wrap into multiple lines. The height of the control will automatically adapt to the number of lines necessary."
/>
<hr />

<label>TextInput control</label>
<TextInput bind:value />
<hr />
