<script>
    export let helpClass = '';
    export let uid;
    export let inline = false;
    export let compact = false;

    let visible = false;
    let t = null;

    function handleHelpMouseenter() {
        const timeout = setTimeout(() => {
            visible = true;
        }, 400);
        t = timeout;
    }

    function handleHelpMouseleave() {
        clearTimeout(t);
        visible = false;
    }
</script>

<style>
    .help {
        position: relative;
    }
    .help:not(.inline) {
        float: right;
        top: 4px;
    }

    .help.compact {
        top: 0px;
    }
    .help.inline {
        margin-top: 0;
    }
    .help-icon {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 1.3em;
        height: 1.3em;
        border-radius: 50%;
        border: 1px solid var(--color-dw-gray-lighter);
        background: transparent;
        text-align: center;
        color: var(--color-dw-grey);
        font-weight: 700;
        font-size: 12px;
        cursor: default;
    }
    .help-icon:hover {
        background: var(--color-dw-scooter-light);
        border: 1px solid var(--color-dw-scooter-light);
        color: #f9f9f9;
    }
    .hat-icon {
        font-size: 16px;
        color: #fff;
        position: absolute;
        left: -15px;
        top: 12px;
    }
    .help-content {
        text-align: left;
        position: absolute;
        z-index: 1000;
        top: -8px;
        left: -5px;
        padding: 8px;
        text-indent: 25px;
        background: var(--color-dw-scooter-light);
        color: #fff;
        width: 240px;
        border-radius: 2px;
        box-shadow: 3px 2px 2px rgba(0, 0, 0, 0.1);
    }
    .help-content :global(img) {
        max-width: none;
    }
    .help-content :global(a) {
        color: white;
        text-decoration: underline;
    }
</style>

<div
    class="help {helpClass}"
    class:compact
    class:inline
    on:mouseenter={handleHelpMouseenter}
    on:mouseleave={handleHelpMouseleave}
    data-uid={uid}
>
    <span class="help-icon">?</span>
    {#if visible}
        <div class="help-content">
            <i class="hat-icon im im-graduation-hat" />
            <slot />
        </div>
    {/if}
</div>