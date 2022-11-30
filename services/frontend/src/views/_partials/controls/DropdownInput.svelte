<script>
    import { createEventDispatcher } from 'svelte';
    import Dropdown from '_partials/Dropdown.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';

    export let options = [];
    export let value = null;
    export let active = false;
    export let disabled = false;
    export let placeholder = '';
    export let uid = undefined;
    export let width = 'auto';
    export let block = false;

    /*
     * you can use a custom itemRenderer to render items as Svelte component
     * instead of inline HTML
     */
    export let itemRenderer = null;

    /*
     * if this component is "passive" it won't change the bound value after
     * the user changed the selection (but still fires the `change` event)
     */
    export let passive = false;

    let selectedItem;
    $: curValueItem = options.find(option => option.value === value);
    $: selectedItemIndex = options.indexOf(selectedItem);

    const dispatch = createEventDispatcher();

    $: {
        selectedItem = options.find(option => option.value === value);
    }

    const handleOptionClick = option => {
        // Send this as an object, because if we send it as a plain value, and this value is `undefined`,
        // then Svelte will convert it to `null` when sending the event up to parent component, which we don't want.
        if (!passive) value = option.value;
        dispatch('change', { value: option.value });
        active = false;
    };

    function onKeyDown(event) {
        if (active) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                const newIndex =
                    (selectedItemIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) %
                    options.length;
                selectedItem = options[newIndex];
                event.preventDefault(); // prevent page from scrolling up/down
            }
            if (event.key === 'Escape') {
                active = false;
            }
            if (event.key === 'Enter' || event.key === ' ') {
                active = false;
                handleOptionClick(selectedItem);
                event.preventDefault(); // prevent dropdown from opening again
            }
        }
    }
</script>

<style lang="scss">
    .trigger {
        &:before {
            box-shadow: none; // remove button custom shadow
        }
        &-content {
            max-width: calc(100% - 1em);
            overflow: hidden;
            text-overflow: ellipsis;
        }
        :global(.icon) {
            color: $grey;
        }
        &:hover {
            :global(.icon) {
                color: $black;
            }
        }
    }
    .dropdown {
        &-item {
            border: none;
            background-color: transparent;
        }
    }
</style>

<svelte:window on:keydown={onKeyDown} />

<Dropdown bind:active bind:disabled {uid} class={block ? 'is-block' : ''}>
    <button
        class="button trigger is-justify-content-space-between has-text-weight-normal"
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        slot="trigger"
        style:width
        {disabled}
    >
        <span class="trigger-content">
            {#if curValueItem}
                <span class="current-value">
                    {#if itemRenderer}
                        <svelte:component this={itemRenderer} item={curValueItem} />
                    {:else}
                        {@html purifyHtml(curValueItem.label)}
                    {/if}
                </span>
            {:else}
                <span class="has-text-grey-light is-italic">{placeholder}</span>
            {/if}
        </span>
        <IconDisplay icon="expand-down-bold" className="ml-2" size="1em" />
    </button>
    <div class="dropdown-content" slot="content">
        {#each options as option}
            <button
                class="dropdown-item"
                class:is-active={selectedItem === option}
                on:click={() => handleOptionClick(option)}
            >
                {#if itemRenderer}
                    <svelte:component this={itemRenderer} item={option} />
                {:else}
                    {@html purifyHtml(option.label)}
                {/if}
            </button>
        {/each}
    </div>
</Dropdown>
