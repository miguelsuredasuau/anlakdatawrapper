<script>
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { createEventDispatcher, getContext } from 'svelte';
    import debounce from 'lodash/debounce';

    const messages = getContext('messages');
    let __;

    $: {
        __ = (key, scope = 'core') => messages.translate(key, scope, $messages);
    }

    const dispatch = createEventDispatcher();

    export let value = '';

    let isLoading = false;

    const onInput = (() => {
        const dispatchEvent = debounce(() => {
            dispatch('search', {
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

<div class="control has-icons-left" class:is-loading={isLoading}>
    <input class="input" type="text" bind:value on:input={onInput} placeholder={__('Search')} />
    <IconDisplay icon="search" className="is-left" size="20px" />
</div>
