<script>
    export let disabled = false;
    export let width = 'auto';
    export let visible = false;

    let dropdownButtonEl;

    function handleButtonClick() {
        if (disabled) return;
        visible = !visible;
    }

    function handleWindowClick(event) {
        if (!event.target || event.target === dropdownButtonEl || (dropdownButtonEl && dropdownButtonEl.contains(event.target))) return;
        visible = false;
    }
</script>

<style>
    .dropdown-input-wrap {
        display: inline-block;
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
        top: 100%;
        left: 0;
        z-index: 100002;
        min-width: 160px;
        padding: 5px 0;
        margin: 2px 0 0;
        list-style: none;
        background-color: #fff;
        box-shadow: 3px 3px 3px #eee;
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        background-clip: padding-box;
    }
</style>

<svelte:window on:click={handleWindowClick} />

<div class="dropdown-input-wrap">
    <span class="dropdown-input-btn" bind:this={dropdownButtonEl} on:click|preventDefault={handleButtonClick}>
        <slot name="button">
            <button class="btn btn-small"><i class="fa fa-chevron-{visible ? 'up' : 'down'}" /></button>
        </slot>
    </span>
    {#if visible}
        <div class="dropdown-input-content" style="width: {width}">
            <slot name="content">
                <div class="dropdown-input-inner">DropdownControl content</div>
            </slot>
        </div>
    {/if}
</div>
