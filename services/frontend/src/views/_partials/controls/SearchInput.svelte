<script>
    import TextInput from '_partials/controls/TextInput.svelte';
    import debounce from 'lodash/debounce';

    export let __ = key => key;
    export let uid;
    export let value = '';
    export let onInput;
    export let placeholder = __('Search');
    let className;
    export { className as class };

    export let isLoading = false;

    const handleInput = (() => {
        if (!onInput) return;

        const dispatchEvent = debounce(() => {
            onInput({
                done() {
                    isLoading = false;
                }
            });
        }, 1000);
        return () => {
            isLoading = true;
            dispatchEvent();
        };
    })();
</script>

<TextInput
    icon="search"
    {placeholder}
    loading={isLoading}
    bind:value
    on:input={handleInput}
    {uid}
    class={className}
    deletable
/>
