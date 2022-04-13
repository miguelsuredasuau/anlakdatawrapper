<script>
    import { createEventDispatcher, beforeUpdate } from 'svelte';
    import debounce from 'lodash/debounce';
    import IconDisplay from './IconDisplay.svelte';

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
        if (!query) {
            return options;
        }
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
     * Path to SVG tile set on https://app.datawrapper.de
     */
    export let assetURL = '/lib/icons/symbol/svg/sprite.symbol.svg';

    /**
     * items contains the list of options showing in the dropdown
     * (e.g. matched by the search query)
     */
    let items = options || [];

    /**
     * selectedIndex is the index of the currently
     * selected item in the matches list.
     */
    let selectedIndex = 0;

    /**
     * if true, the input shows a loading indicator
     */
    let searching = false;

    let inFocus = false;

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
     *
     * @param item
     */
    function handleSelect(item) {
        value = item;
        searchQuery = item.label;
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
            if (!open) {
                open = true;
            }
            if (isNaN(selectedIndex)) selectedIndex = -1;
            const len = items.length || 0;
            if (event.key === 'ArrowUp') {
                selectedIndex = (selectedIndex - 1 + len) % len;
            }
            if (event.key === 'ArrowDown') {
                selectedIndex = (selectedIndex + 1) % len;
            }
        }
        if (event.key === 'Escape' || event.key === 'Tab') {
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
        open = true;
        inFocus = true;
    }

    function handleBlur() {
        inFocus = false;
    }

    function handleWindowClick(event) {
        if (refDropdown && !refDropdown.contains(event.target)) {
            open = false;
        }
    }

    // track value changes
    let _value;
    beforeUpdate(() => {
        if (value !== _value) {
            if (value) {
                searchQuery = value.label;
            }
            _value = value;
        }
    });

    /**
     * debounced 'input' event handler, fires 200ms
     * after the user has last changed the searchQuery
     * value
     */
    let lastRunSig = null;
    let updateItemsDebounced = debounce(async query => {
        const sig = (lastRunSig = Math.round(Math.random() * 1e8));
        if (value && query !== value.label) {
            // user changed the query, so we remove the value and open the options
            value = null;
            open = true;
        }
        searching = true;
        const results = await search(query);
        if (sig !== lastRunSig) {
            // a newer search query has been triggered
            // since we started this one, so we're going
            // to ignore the results and wait for the newer
            // one to finish
            return;
        }
        items = results;
        selectedIndex = 0;
        searching = false;
    }, 200);
    $: updateItemsDebounced(searchQuery);
    $: selectedItem = items[selectedIndex];

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

    function onClick(event) {
        refSearchInput.focus();
        open = true;
    }
</script>

<style>
    .dropdown {
        display: flex;
        flex-wrap: wrap;
        position: relative;
    }

    .dropdown-trigger {
        flex-grow: 1;
        display: flex;
        border: 1px solid #ddd;
        border-top-color: #ccc;
        border-left-color: #ccc;
        align-items: center;
        background-color: white;
    }

    .dropdown-trigger.focus {
        border-color: #0a86ae;
    }

    .dropdown-trigger input {
        border: 0;
    }
    .dropdown .icon {
        margin: 0 4px;
        color: #ccc;
        font-size: 17px;
        line-height: 1;
    }
    .dropdown.selection input::-webkit-input-placeholder {
        color: #222;
        font-weight: 300;
        opacity: 1;
    }
    .dropdown.selection input::-moz-placeholder {
        color: #222;
        font-weight: 300;
        opacity: 1;
    }
    .dropdown.selection input:-ms-input-placeholder {
        color: #222;
        font-weight: 300;
        opacity: 1;
    }
    .dropdown.selection input:-moz-input-placeholder {
        color: #222;
        font-weight: 300;
        opacity: 1;
    }
    .dropdown-results li.selected {
        background: #18a1cd33;
    }
    input {
        margin-bottom: 0px;
        flex-grow: 4;
    }
    .btn-small {
        max-width: 60px;
        padding: 4px 10px;
        border-radius: 0px 3px 3px 0px !important;
        margin-left: -4px;
        border-left: none;
    }
    .dropdown-results {
        position: absolute;
        top: 100%;
        z-index: 1;
        max-height: 150px;
        overflow: auto;
        margin: 0px;
        width: calc(100%);
        background-color: white;
        border: 1px solid #cccccc;
        margin-top: 0px;
        border-top: 0;
        box-shadow: 2px 2px 2px #000 1;
    }
    .dropdown-results li {
        color: black;
        text-decoration: none;
        display: block;
        padding: 5px 6px;
    }
    .dropdown-results li:hover {
        background-color: #18a1cd33;
        cursor: pointer;
    }

    .dropdown-results li.helper-message {
        background-color: white;
        color: #858585;
        text-align: center;
        cursor: default;
    }
</style>

<svelte:window on:click={handleWindowClick} />
<div
    on:click|stopPropagation
    class="control-group vis-option-group vis-option-type-select"
    data-uid={uid}
>
    <div
        bind:this={refDropdown}
        class:selection={!open && value}
        class:icon
        class="dropdown"
        on:click={onClick}
    >
        <div class="dropdown-trigger" class:focus={inFocus}>
            {#if icon}
                <div class:icon>
                    <IconDisplay {assetURL} {icon} />
                </div>
            {/if}
            <input
                type="search"
                {id}
                bind:this={refSearchInput}
                placeholder={open ? placeholder : (value && value.label) || placeholder}
                aria-label={ariaLabel}
                bind:value={searchQuery}
                on:focus={handleFocus}
                on:blur={handleBlur}
                on:keydown={handleKeydown}
            />
            {#if searching}
                <div class="icon">
                    <IconDisplay
                        {assetURL}
                        size="16px"
                        icon="loading-spinner"
                        spin
                        timing="steps(12)"
                        duration="1.5s"
                    />
                </div>
            {/if}
        </div>
        <button class="btn btn-small btn-primary" tabindex="-1">
            <span class="caret" />
        </button>

        {#if open && items.length}
            <ul bind:this={refDropdownMenu} class="dropdown-results">
                {#each items as item, i}
                    <li
                        class:selected={i === selectedIndex}
                        style={item.style || ''}
                        on:click|stopPropagation={() => handleSelect(item)}
                    >
                        {#if customItemRenderer}
                            <svelte:component
                                this={customItemRenderer}
                                {item}
                                active={i === selectedIndex}
                                on:select={event => handleSelect(event.detail)}
                            />
                        {:else}
                            {@html highlightQuery(item.label, searchQuery)}
                        {/if}
                    </li>
                {/each}
            </ul>
        {:else if open && searching}
            <ul bind:this={refDropdownMenu} class="dropdown-results">
                <li class="helper-message">
                    {@html searchingMsg}
                </li>
            </ul>
        {:else if open && searchQuery && !items.length}
            <ul bind:this={refDropdownMenu} class="dropdown-results">
                <li class="helper-message">
                    {@html noResultsMsg || 'No results'}
                </li>
            </ul>
        {/if}
    </div>
</div>
