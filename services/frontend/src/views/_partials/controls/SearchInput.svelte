<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { getContext } from 'svelte';
    import debounce from 'lodash/debounce';

    const messages = getContext('messages');
    let __;

    $: {
        __ = (key, scope = 'core') => messages.translate(key, scope, $messages);
    }

    export let value = '';
    export let onInput;

    let isLoading = false;

    const handleInput = (() => {
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

<div class="control has-icons-left" class:is-loading={isLoading} data-uid="search-input">
    <input class="input" type="text" bind:value on:input={handleInput} placeholder={__('Search')} />
    <IconDisplay icon="search" className="is-left" size="20px" />
</div>
