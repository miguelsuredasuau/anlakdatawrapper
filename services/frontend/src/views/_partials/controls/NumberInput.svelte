<script>
    export let value = null;
    export let disabled = false;

    /**
     * step size for spinner/keyboard controls
     */
    export let step = 1;

    /**
     * limit the lower value range
     */
    export let min = null;

    /**
     * limit the upper value range
     */
    export let max = null;

    /**
     * optional placeholder to be displayed in absense of value
     */
    export let placeholder = null;

    /**
     * toggle the NumberInput spinner
     */
    export let spinner = true;

    /**
     * optional unit to be displayed after the input
     */
    export let unit = null;

    /**
     * UID for testing
     */
    export let uid = null;

    let className = '';
    let input;

    export { className as class };
    export let width = 'auto';
</script>

<style lang="scss">
    input[type='number']:not(.spinner) {
        -moz-appearance: textfield;
        appearance: textfield;
        margin: 0;
    }
    input[type='number']:not(.spinner)::-webkit-inner-spin-button,
    input[type='number']:not(.spinner)::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    .control input[type='number'] {
        display: none;
    }
    .control:focus-within:not(.disabled),
    .control:hover:not(.disabled) {
        input[type='number'] {
            display: inline;
        }
        input[type='text'] {
            display: none;
        }
    }
</style>

<div class="control number-input is-flex" class:disabled data-uid={uid}>
    <input
        bind:this={input}
        class="input {className}"
        type="number"
        style="width:{width}"
        bind:value
        on:change
        class:spinner
        {step}
        {placeholder}
        {disabled}
        {min}
        {max}
    />
    <input
        type="text"
        class="input {className}"
        style="width:{width};"
        placeholder={placeholder || ''}
        {disabled}
        value={value !== 0 && !value ? '' : value}
        on:focus={() => input.focus()}
    />
    {#if unit}
        <span class="p-1 has-text-grey">{unit}</span>
    {/if}
</div>
