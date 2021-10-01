<script>
    import ControlGroup from './ControlGroup.svelte';
    import NumberInput from './NumberInput.svelte';

    export let label;
    export let value;
    export let allowUndefined = false;
    export let disabled = false;
    export let help = null;
    export let labelWidth = '100px';
    export let max = 100;
    export let min = 0;
    export let multiply = 1;
    export let placeholder = null;
    export let slider = true;
    export let step = 1;
    export let unit = '';
    export let uid;
</script>

<ControlGroup
    {disabled}
    type="number"
    valign="middle"
    {label}
    {labelWidth}
    {help}
    {uid}
    helpClass="mt-1"
>
    <NumberInput
        bind:value
        {allowUndefined}
        {disabled}
        {max}
        {min}
        {multiply}
        {placeholder}
        {slider}
        {step}
        {unit}
        class="mt-1"
    />
</ControlGroup>
