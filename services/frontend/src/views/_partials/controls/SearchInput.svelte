<script>
    import TextInput from '_partials/controls/TextInput.svelte';
    import { getContext } from 'svelte';
    import debounce from 'lodash/debounce';

    const msg = getContext('messages');
    function createTranslate(msg, messages) {
        return (key, scope = 'core') => msg.translate(key, scope, messages);
    }
    $: __ = createTranslate(msg, $msg);

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
