<script>
    import { createEventDispatcher, onMount, tick } from 'svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import clone from '@datawrapper/shared/clone.js';
    import isEqual from 'lodash/isEqual';
    import uniq from 'lodash/uniq';
    const dispatch = createEventDispatcher();

    export let uid;
    export let tags = [];
    export let ariaLabel = null;

    export let checked = false;
    export let loading = false;

    function serialize(tags) {
        return uniq(tags.map(s => s.trim().toLowerCase()).filter(t => t !== '')).join(', ');
    }

    let tagsValue;
    let _tags = clone(tags);

    async function onInput() {
        tags = uniq(
            (tagsValue || '')
                .split(',')
                .map(s => s.trim().toLowerCase())
                .filter(t => t !== '')
        );
        _tags = clone(tags);
        dispatch('change', tags);
    }

    function onBlur() {
        tagsValue = serialize(tags);
    }

    async function deleteTag(tag) {
        tags = tags.filter(t => t !== tag);
        await tick();
        tagsValue = serialize(tags);
    }

    onMount(() => {
        tagsValue = serialize(tags);
    });

    $: {
        if (tags && _tags && !isEqual(tags, _tags)) {
            // tags have changed from outside
            _tags = clone(tags);
            if (tagsValue !== serialize(tags)) {
                tagsValue = serialize(tags);
            }
        }
    }
</script>

<div
    class="control"
    class:is-loading={loading}
    class:has-icons-right={loading || checked}
    data-uid={uid}
>
    <input
        class="input"
        type="text"
        bind:value={tagsValue}
        on:change={onInput}
        on:input={onInput}
        on:blur={onBlur}
        data-lpignore="true"
        autocomplete="off"
        aria-label={ariaLabel}
    />
    {#if tags.length}
        <div class="tags mt-2">
            {#each tags as tag}
                <span class="tag has-text-weight-bold is-primary">
                    {tag}
                    <button class="delete is-small" on:click={() => deleteTag(tag)} />
                </span>
            {/each}
        </div>
    {/if}
    {#if !loading && checked}
        <IconDisplay icon="checkmark-bold" className="is-right" />
    {/if}
</div>
