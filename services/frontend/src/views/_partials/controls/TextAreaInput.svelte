<script>
    export let value = '';
    export let id = '';
    export let uid = '';
    export let autocomplete = 'off';
    export let disabled = false;

    export let placeholder = '';
    export let width = '100%';
    export let height = 'auto';
    export let resize = 'both';
    export let textDirection = 'ltr';
</script>

<style>
    .textarea-container {
        display: flex;
    }

    textarea {
        margin: 0;
        width: 100%;
        box-sizing: border-box;
        line-height: 20px !important;
    }
</style>

<div class="textarea-container" style="width:{width}" data-uid={uid}>
    <textarea
        class="input"
        bind:value
        style="height:{height};resize:{resize}"
        dir={textDirection}
        {id}
        {disabled}
        {placeholder}
        {autocomplete}
    />
</div>
