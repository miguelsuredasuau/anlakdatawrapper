<script>
    import { createEventDispatcher } from 'svelte';
    import DropdownInput from './DropdownInput.svelte';
    import DropdownListItem from './DropdownListItem.svelte';

    export let value;
    export let options = [];
    export let disabled = false;
    export let itemRenderer = DropdownListItem;
    export let align = 'right';
    export let buttonClass;
    export let uid;

    $: selectedOption = options.find(option => option.value === value);

    const dispatch = createEventDispatcher();

    function handleOptionClick(option) {
        if (disabled) return;
        value = option.value;
    }

    function handleButtonClick() {
        if (disabled) return;
        dispatch('click', value);
    }

    function handleOptionButtonKeydown(event) {
        if (disabled) return;
        if (event.key === 'ArrowDown') {
            moveSelection(1);
        } else if (event.key === 'ArrowUp') {
            moveSelection(-1);
        }
    }

    function moveSelection(diff) {
        let selectedIndex = options.map(option => option.value).indexOf(value);
        selectedIndex += diff;
        if (selectedIndex < 0) selectedIndex = options.length - 1;
        else if (selectedIndex > options.length - 1) selectedIndex = 0;
        value = options[selectedIndex].value;
    }
</script>

<style>
    .dropdown-button {
        position: relative;
    }
    .dropdown-button > button {
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
    }
    .dropdown-input-btn-inner > button {
        margin-left: -1px;
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
        pointer-events: auto;
    }
    .dropdown-menu {
        display: block;
        position: static;
        top: auto;
        left: auto;
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        box-shadow: none;
        max-height: 300px;
        overflow: auto;
        border-radius: 0;
    }
    .dropdown-menu a {
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
    }
    .selected {
        background: rgb(24, 161, 205, 0.2);
    }
</style>

<div class="dropdown-button btn-group" data-uid={uid}>
    <button
        class="btn {buttonClass ? `btn-${buttonClass}` : ''}"
        {disabled}
        on:click={handleButtonClick}>{selectedOption && selectedOption.label}</button
    >
    <DropdownInput {disabled} {align} selfAlignContent={align === 'right'}>
        <span slot="button">
            <div class="dropdown-input-btn-inner btn-group">
                <button
                    class="btn {buttonClass ? `btn-${buttonClass}` : ''}"
                    {disabled}
                    on:keydown={handleOptionButtonKeydown}><span class="caret" /></button
                >
            </div>
        </span>
        <span slot="content">
            <ul class="dropdown-menu">
                {#if options.length}
                    {#each options as option}
                        <li class:selected={value === option.value}>
                            <a
                                href="#/{option.value}"
                                on:click|preventDefault={handleOptionClick(option)}
                            >
                                <svelte:component this={itemRenderer} {...option} />
                            </a>
                        </li>
                    {/each}
                {/if}
            </ul>
        </span>
    </DropdownInput>
</div>
