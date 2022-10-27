<script>
    import { createEventDispatcher, beforeUpdate, getContext } from 'svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import debounce from 'lodash/debounce';
    import decodeHtml from '@datawrapper/shared/decodeHtml.js';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';

    const msg = getContext('messages');
    function createTranslate(msg, messages) {
        return (key, scope = 'core', replacements) =>
            msg.translate(key, scope, messages, replacements);
    }
    $: __ = createTranslate(msg, $msg);

    const dispatch = createEventDispatcher();

    /**
     * uid for testing purposes
     */
    export let uid;

    /**
     * allow setting id for accessiblity purposes
     */
    export let id = null;

    /**
     * optional aria-label for input element
     */
    export let ariaLabel = null;

    /**
     * placeholder for input element
     */
    export let placeholder = null;

    /**
     * async search function, returns list of matches
     * as { value, label } pairs.
     *
     * The default implementation is to case insensitive strict matching
     * in the options labels. Can be overwritten to search in external
     * data sources (API calls etc)
     */
    export let search = query => {
        query = query.toLowerCase();
        return options.filter(d => d.label.toLowerCase().includes(query));
    };

    /**
     * optional: pass a list of { value, label } pairs
     * to use the default search function
     */
    export let options = [];

    /**
     * optional icon
     */
    export let icon = null;

    /**
     * the current value
     */
    export let value;

    /**
     * allow passing a custom Svelte component
     * for rendering of the items in the matches list
     */
    export let customItemRenderer = null;

    /**
     * export the displayed query string
     */
    export let searchQuery;

    /**
     * allow setting a custom messages to be shown
     * in case no results match the entered query
     */
    export let noResultsMsg = null;
    export let searchingMsg = null;

    /**
     * number of milliseconds to delay firing the 'input' event after the user has last changed the
     * `searchQuery` value
     */
    export let delay = 200;

    /**
     * matches contains the list of items matching
     * the entered search query
     */
    let matches = [];

    /**
     * selectedIndex is the index of the currently
     * selected item in the matches list.
     */
    let selectedIndex = 0;

    /**
     * if true, the input shows a loading indicator
     */
    let searching = false;

    /**
     * html element references
     */
    let refDropdown;
    let refDropdownMenu;
    let refSearchInput;

    /**
     * internal open/close state
     */
    let open = false;

    /**
     * debounced 'input' event handler, fires `delay` milliseconds after the user has last changed
     * the `searchQuery` value
     */
    let lastRunSig = null;
    const handleInput = debounce(async function () {
        const sig = (lastRunSig = Math.round(Math.random() * 1e8));
        if (value && searchQuery !== value.label) {
            // user changed the query, so we remove the value
            value = null;
        }
        searching = true;
        const results = await search(searchQuery);
        if (sig !== lastRunSig) {
            // a newer search query has been triggered
            // since we started this one, so we're going
            // to ignore the results and wait for the newer
            // one to finish
            return;
        }
        matches = results;
        open = true;
        selectedIndex = 0;
        searching = false;
    }, delay);

    /**
     *
     * @param item
     */
    function handleSelect(item) {
        matches = [];
        value = item;
        searching = false;
        open = false;
        dispatch('select', item);
    }

    /**
     * handle keydown events in the input element to track
     * presses of [return], [up], [down], and [escape] keys
     * @param event
     */
    function handleKeydown(event) {
        if (event.key === 'Enter') {
            handleSelect(selectedItem);
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (isNaN(selectedIndex)) selectedIndex = -1;
            const len = matches.length || 0;
            if (event.key === 'ArrowUp') {
                selectedIndex = (selectedIndex - 1 + len) % len;
            }
            if (event.key === 'ArrowDown') {
                selectedIndex = (selectedIndex + 1) % len;
            }
        }
        if (event.key === 'Escape') {
            matches = [];
            searching = false;
            open = false;
            refSearchInput.blur();
        }
    }

    function handleReset() {
        value = null;
        searchQuery = '';
        searching = false;
        open = false;
        dispatch('select', { value: null });
    }

    function handleFocus() {
        if (searchQuery) {
            handleInput();
        } else if (options.length) {
            matches = options.slice(0);
            open = true;
        }
    }

    function handleWindowClick(event) {
        if (!refDropdown.contains(event.target)) {
            open = false;
        }
    }

    // track value changes
    let _value;

    beforeUpdate(() => {
        if (value !== _value) {
            if (value) {
                searchQuery = value.label;
            } else if (_value && searchQuery === _value.label) {
                searchQuery = '';
            }
            // reset matches
            matches = [];
            _value = value;
        }
    });

    $: selectedItem = matches[selectedIndex];

    // track changes of selectedIndex;
    let _selectedIndex;

    beforeUpdate(() => {
        if (selectedIndex !== _selectedIndex) {
            _selectedIndex = selectedIndex;
            if (refDropdownMenu) {
                /*
                 * automatically scroll dropdown content to keep
                 * the selected item in view
                 */
                const itemBox = refDropdownMenu.children[selectedIndex].getBoundingClientRect();
                const menuBox = refDropdownMenu.getBoundingClientRect();
                if (itemBox.y + itemBox.height - menuBox.y > menuBox.height) {
                    // item is out of bottom view
                    refDropdownMenu.scrollBy(
                        0,
                        itemBox.y + itemBox.height - menuBox.y - menuBox.height + 5
                    );
                } else if (itemBox.y - menuBox.y < 0) {
                    // item is out of top view
                    refDropdownMenu.scrollBy(0, itemBox.y - menuBox.y - 5);
                }
            }
        }
    });

    /**
     * injects a <em /> tag around the part of the match label
     * that matches the search term query
     *
     * @param matchLabel
     * @param query
     */
    function highlightQuery(matchLabel, query) {
        if (!query) return matchLabel;
        const s0 = matchLabel.toLowerCase().indexOf(query.toLowerCase());
        if (s0 > -1 && query.length < matchLabel.length) {
            return `${matchLabel.substr(0, s0)}<mark>${matchLabel.substr(
                s0,
                query.length
            )}</mark>${matchLabel.substr(s0 + query.length)}`;
        }
        return matchLabel;
    }
</script>

<style lang="scss">
    @import '../../../styles/export.scss';

    .dropdown-menu {
        width: 100%;
    }
    .dropdown-content {
        max-height: 300px;
        overflow-y: auto;
    }
    .dropdown-item {
        white-space: normal;
    }
    .reset-button :global(.icon) {
        pointer-events: all !important;
    }
    .dropdown-item :global(mark) {
        background: fade-out($dw-orange, 0.5);
        font-weight: $weight-medium;
        color: inherit;
    }
    input.incomplete:not(:focus) {
        color: $dw-grey;
    }
</style>

<svelte:window on:click={handleWindowClick} />

<div class="dropdown" bind:this={refDropdown} class:is-active={open || searching} data-uid={uid}>
    <div class="dropdown-trigger">
        <div
            class="control has-icons-right"
            class:has-icons-left={!!icon}
            class:is-loading={searching}
        >
            <input
                class="input"
                type="text"
                {id}
                bind:this={refSearchInput}
                data-lpignore="true"
                aria-label={ariaLabel}
                autocomplete="off"
                bind:value={searchQuery}
                on:input={handleInput}
                on:focus={handleFocus}
                on:keydown={handleKeydown}
                class:incomplete={!value && !open && !searching && searchQuery}
                {placeholder}
            />
            {#if icon}
                <IconDisplay {icon} className="is-left" size="20px" />
            {/if}
            {#if !searching && !value}
                <IconDisplay className="is-small is-right" size="16px" icon="expand-down-bold" />
            {:else if value}
                <a
                    class="reset-button icon is-small is-right"
                    href="#/reset"
                    on:click|preventDefault={handleReset}
                >
                    <IconDisplay icon="close" size="16px" />
                </a>
            {/if}
        </div>
    </div>
    {#if open || searching}
        <div class="dropdown-menu" role="menu">
            <div class="dropdown-content" bind:this={refDropdownMenu}>
                {#if matches.length}
                    {#each matches as match, i}
                        {#if customItemRenderer}
                            <svelte:component
                                this={customItemRenderer}
                                item={match}
                                active={i === selectedIndex}
                                on:select={event => handleSelect(event.detail)}
                            />
                        {:else}
                            <a
                                href="#/{match.value}"
                                on:click|preventDefault|stopPropagation={() => handleSelect(match)}
                                class="dropdown-item"
                                class:is-active={i === selectedIndex}
                            >
                                {@html purifyHtml(
                                    highlightQuery(decodeHtml(match.label), searchQuery),
                                    '<mark>'
                                )}
                            </a>
                        {/if}
                    {/each}
                {:else if searching}
                    <div class="dropdown-item has-text-grey has-text-centered">
                        {searchingMsg || __('typeahead / searching')}
                    </div>
                {:else}
                    <div class="dropdown-item has-text-grey-dark has-text-centered">
                        {noResultsMsg || __('typeahead / no-results')}
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>
