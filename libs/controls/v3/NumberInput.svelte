<script>
    export let value;
    export let width = '40px';
    export let unit = '';
    export let disabled = false;
    export let multiply = 1;
    export let min = 0;
    export let max = 100;
    export let step = 1;
    export let decimals = null;
    export let allowUndefined = false;
    export let placeholder = null;
    export let slider = true;
    export let uid;
    export let id = null;

    let className = '';
    export { className as class };

    let inputValue;
    const prevState = {};

    $: finalDecimals =
        decimals === null
            ? Math.max(0, -Math.floor(Math.log(step * multiply) / Math.LN10))
            : decimals;

    /**
     * Update the outside world value when the input value changes.
     */
    function setValue() {
        let newValue;
        if (allowUndefined && inputValue === undefined) {
            newValue = undefined;
        } else {
            newValue = inputValue ? +inputValue.toFixed(finalDecimals) / multiply : 0;
        }
        prevState.value = newValue; // Prevent circular triggering of the statement that reacts on `value` change.
        value = newValue;
    }

    $: if (inputValue !== prevState.inputValue) {
        prevState.inputValue = inputValue;
        setValue();
    }

    /**
     * Update the input value when the outside world value changes.
     */
    function setInputValue() {
        let newInputValue;
        if (allowUndefined && value === undefined) {
            newInputValue = undefined;
        } else {
            newInputValue = +(value * multiply).toFixed(finalDecimals);
        }
        prevState.inputValue = newInputValue; // Prevent circular triggering of the statement that reacts on `inputValue` change.
        inputValue = newInputValue;
    }

    $: if (value !== prevState.value) {
        prevState.value = value;
        setInputValue();
    }
</script>

<style>
    .number-control {
        display: inline-block;
        width: auto;
    }
    .number-control-container {
        display: flex;
        width: 100%;
    }
    .slider {
        flex: 1;
        padding: 5px 10px 0 0;
    }
    .unit {
        font-weight: 300;
        color: #999;
        display: inline-block;
        min-width: 1em;
        padding-right: 5px;
    }
    input[type='range'] {
        margin-right: 10px;
        width: 100%;
    }
    input[type='number'] {
        text-align: right;
        background: #fcfcfc;
        -moz-appearance: textfield;
        appearance: textfield;
        margin: 0;
    }
    input[type='range'][disabled] {
        opacity: 0.6;
        cursor: default;
    }
    input[type='number'][disabled] {
        color: #999;
        background: #eee;
        border-color: #ddd;
        cursor: default;
    }
    input[type='number']::-webkit-inner-spin-button,
    input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type='number']:hover {
        -moz-appearance: textfield-multiline;
        appearance: textfield-multiline;
        text-align: center;
    }
    input[type='number'][disabled]:hover {
        -webkit-appearance: none;
        -moz-appearance: textfield;
        appearance: textfield;
        text-align: right;
    }
    input[type='number']:hover::-webkit-inner-spin-button,
    input[type='number']:hover::-webkit-outer-spin-button {
        -webkit-appearance: inner-spin-button;
        margin: 0;
    }
    input[type='number'][disabled]:hover::-webkit-inner-spin-button,
    input[type='number'][disabled]:hover::-webkit-outer-spin-button {
        -webkit-appearance: unset;
        margin: 0;
    }
</style>

<div class="number-control {className}" data-uid={uid}>
    <div class="number-control-container">
        {#if slider}
            <div class="slider">
                <input
                    type="range"
                    {disabled}
                    min={min * multiply}
                    max={max * multiply}
                    step={step * multiply}
                    bind:value={inputValue}
                />
            </div>
        {/if}
        <div class="value">
            <input
                style="width: {width}"
                type="number"
                {disabled}
                {id}
                min={min * multiply}
                max={max * multiply}
                step={step * multiply}
                {placeholder}
                bind:value={inputValue}
            />
            {#if unit}
                <span class="unit">{unit}</span>
            {/if}
        </div>
    </div>
</div>
