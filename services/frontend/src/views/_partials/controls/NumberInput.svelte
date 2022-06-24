<script>
    export let placeholder = null;
    export let value = 0;
    export let disabled = null;

    export let spinner = false;
    let className = '';
    export { className as class };
    export let width = 'auto';
</script>

<style>
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
</style>

<input
    class="input {className}"
    type="number"
    style="width:{width}"
    bind:value
    on:change
    class:spinner
    {placeholder}
    {disabled}
/>
