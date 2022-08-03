<script>
    import { createEventDispatcher } from 'svelte';
    import ControlGroup from './ControlGroup.svelte';
    import DropdownInput from './DropdownInput.svelte';
    import DropdownListItem from './DropdownListItem.svelte';

    export let disabled = false;
    export let value;
    export let options = [];
    export let width = 'auto';
    export let label = '';
    export let labelWidth = 'auto';
    export let valign = 'middle';
    export let help = false;
    export let inline = true;
    export let itemRenderer = DropdownListItem;
    export let placeholder = '(select an item)';
    export let forcePlaceholder = false;
    export let forceLabel = false;
    export let miniHelp = null;
    export let uid;

    let currentItem;
    $: {
        if (forcePlaceholder) {
            currentItem = {
                label: `<span style="color: #999; font-size: 12px;">${placeholder}</span>`
            };
        } else if (forceLabel) {
            currentItem = typeof forceLabel === 'string' ? { label: forceLabel } : forceLabel;
        } else {
            currentItem = options.find(option => option.value === value);
        }
    }

    const dispatch = createEventDispatcher();

    function handleOptionClick(option) {
        value = option.value;
        dispatch('change', option.value);
    }

    function handleButtonKeydown() {
        if (event.key === 'ArrowDown') {
            moveSelection(event, 1);
        } else if (event.key === 'ArrowUp') {
            moveSelection(event, -1);
        }
    }

    function moveSelection(event, diff) {
        let selIndex = options.map(option => option.value).indexOf(value);
        if (value < 0) selIndex = diff > 0 ? diff : options.length + diff;
        else selIndex += diff;
        const newVal = options[(selIndex + options.length) % options.length].value;
        value = newVal;
        dispatch('change', newVal);
    }
</script>

<style>
    .dropdown-toggle {
        display: flex;
        justify-content: space-between;
        background: #fff;
        box-shadow: none;
    }
    .dropdown-toggle.disabled {
        pointer-events: none;
        opacity: 0.5;
    }
    .caret {
        margin-left: 5px;
    }
    .btn-label {
        overflow: hidden;
        text-overflow: ellipsis;
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
    }
    .selected {
        background: rgb(24, 161, 205, 0.2);
    }
</style>

<ControlGroup
    {inline}
    type="dropdown"
    {label}
    labelWidth={inline && !labelWidth ? 'auto' : labelWidth}
    {valign}
    {help}
    {miniHelp}
    {disabled}
    helpClass="mt-1"
    {uid}
>
    <DropdownInput {disabled} {width}>
        <span slot="button">
            <div class="btn-group mt-1" class:mb-1={!!miniHelp}>
                <button
                    class="btn dropdown-toggle"
                    class:disabled
                    style="width: {width}"
                    on:keydown={handleButtonKeydown}
                >
                    <span class="btn-label">
                        {#if forcePlaceholder}
                            {@html currentItem.label}
                        {:else}
                            <svelte:component this={itemRenderer} {...currentItem} />
                        {/if}
                    </span>
                    <span class="caret" />
                </button>
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
</ControlGroup>
