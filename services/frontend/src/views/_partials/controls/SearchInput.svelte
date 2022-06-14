<script>
    import TextInput from '_partials/controls/TextInput.svelte';
    import { getContext } from 'svelte';
    import debounce from 'lodash/debounce';

    const messages = getContext('messages');
    let __;

    $: {
        __ = (key, scope = 'core') => messages.translate(key, scope, $messages);
    }

    export let uid;
    export let value = '';
    export let onInput;

    let isLoading = false;

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
    placeholder={__('Search')}
    loading={isLoading}
    bind:value
    on:input={handleInput}
    {uid}
/>
