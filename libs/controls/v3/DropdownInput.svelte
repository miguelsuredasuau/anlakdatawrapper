<script>
    export let disabled = false;
    export let width = 'auto';
    export let visible = false;
    export let uid;
    /**
     * Vertical position of the dropdown relative to the trigger button.
     * @type {'bottom' | 'top'}
     */
    export let position = 'bottom';

    /**
     * Horizontal alignment of the dropdown relative to the trigger button.
     * @type {'left' | 'right'}
     */
    export let align = 'left';

    /**
     * Whether the dropdown content should have padding by default.
     * @type {boolean}
     */
    export let defaultContentPadding = true;

    /**
     * Whether this input itself controls alignment positioning of dropdown content.
     * Can be unset if you want a parent component to take over control of alignment.
     * @type {boolean}
     */
    export let selfAlignContent = true;

    let dropdownButtonEl;

    function handleButtonClick() {
        if (disabled) return;
        visible = !visible;
    }

    function handleWindowClick(event) {
        if (
            !event.target ||
            event.target === dropdownButtonEl ||
            (dropdownButtonEl && dropdownButtonEl.contains(event.target))
        )
            return;
        visible = false;
    }

    let iconName;
    $: {
        if (position === 'bottom') {
            iconName = visible ? 'up' : 'down';
        }
        if (position === 'top') {
            iconName = visible ? 'down' : 'up';
        }
    }
</script>

<style>
    .dropdown-input-wrap {
        display: inline-block;
    }
    .dropdown-input-wrap.self-align-content {
        position: relative;
    }
    .dropdown-input-btn {
        display: inline-block;
        cursor: pointer;
    }
    .dropdown-input-btn :global(*) {
        pointer-events: none;
    }
    .dropdown-input-inner {
        padding: 5px 10px;
        font-size: 13px;
    }
    .dropdown-input-content {
        display: block;
        position: absolute;
        z-index: 100002;
        min-width: 160px;
        list-style: none;
        background-color: #fff;
        box-shadow: 3px 3px 3px #eee;
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        background-clip: padding-box;
    }

    .dropdown-input-content-padded {
        padding: 5px 0;
    }

    .dropdown-input-position-top .dropdown-input-content {
        top: auto;
        bottom: 100%;
        margin: 0 0 2px;
    }
    .dropdown-input-position-bottom .dropdown-input-content {
        top: 100%;
        bottom: auto;
        margin: 2px 0 0;
    }

    .dropdown-input-align-left .dropdown-input-content {
        left: 0;
        right: auto;
    }
    .dropdown-input-align-right .dropdown-input-content {
        left: auto;
        right: 0;
    }
</style>

<svelte:window on:click={handleWindowClick} />

<div
    class="dropdown-input-wrap dropdown-input-position-{position} dropdown-input-align-{align}"
    class:self-align-content={selfAlignContent}
    data-uid={uid}
>
    <span
        class="dropdown-input-btn"
        bind:this={dropdownButtonEl}
        on:click|preventDefault={handleButtonClick}
    >
        <slot name="button">
            <button class="btn btn-small"><i class="fa fa-chevron-{iconName}" /></button>
        </slot>
    </span>
    {#if visible}
        <div
            class="dropdown-input-content"
            class:dropdown-input-content-padded={defaultContentPadding}
            style="width: {width}"
        >
            <slot name="content">
                <div class="dropdown-input-inner">DropdownControl content</div>
            </slot>
        </div>
    {/if}
</div>
