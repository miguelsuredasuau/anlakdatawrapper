<script>
    import ControlGroup from './ControlGroup.svelte';
    import TextInput from './TextInput.svelte';
    import { slide } from 'svelte/transition';

    export let value;
    export let label;

    export let append = '';
    export let autocomplete = 'off';
    export let block = false;
    export let disabled = false;
    export let disabledMessage = '';
    export let error = false;
    export let expandable = false;
    export let help = '';
    export let id = '';
    export let labelWidth = '100px';
    export let miniHelp = '';
    export let placeholder = '';
    export let prepend = '';
    export let rows = 5;
    export let valign = 'middle';
    export let width = '100%';
    export let uid;
</script>

<style>
    .d-flex {
        display: flex;
    }
    .disabled-msg {
        font-size: 11px;
        padding-top: 0;
        padding-bottom: 5px;
        font-style: italic;
        color: #a8a8a8;
        line-height: 1.2;
    }
</style>

<ControlGroup
    helpClass="mt-1"
    type="text"
    {block}
    {disabled}
    {error}
    {help}
    htmlFor={id}
    {labelWidth}
    {label}
    {miniHelp}
    {valign}
    {uid}
>
    <div class="d-flex mt-1">
        {#if prepend}
            <div class="prepend">{prepend}</div>
        {/if}
        <TextInput
            {expandable}
            {rows}
            {id}
            {autocomplete}
            {disabled}
            {placeholder}
            {width}
            bind:value
        />
        {#if append}
            <div class="append">{append}</div>
        {/if}
    </div>
</ControlGroup>

{#if disabled && disabledMessage}
    <div transition:slide>
        <div class="disabled-msg">
            {@html disabledMessage}
        </div>
    </div>
{/if}
