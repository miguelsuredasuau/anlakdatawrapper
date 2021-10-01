<script>
    import ControlGroup from './ControlGroup.svelte';
    import SelectInput from './SelectInput.svelte';

    export let disabled = false;
    export let help = null;
    export let inline = false;
    export let label = null;
    export let labelWidth = null;
    export let miniHelp = null;
    export let optgroups = [];
    export let options = [];
    export let valign = 'middle';
    export let value = null;
    export let width = null;
    export let uid;
</script>

<ControlGroup
    type="select"
    {disabled}
    {help}
    helpClass="mt-1"
    {inline}
    labelWidth={inline && !labelWidth ? 'auto' : labelWidth}
    {label}
    {miniHelp}
    {valign}
    {uid}
>
    <SelectInput
        class="mt-1"
        bind:value
        {disabled}
        {options}
        {optgroups}
        width={inline && !width ? 'auto' : width}
        on:change
    />
</ControlGroup>
