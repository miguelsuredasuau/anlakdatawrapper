<script>
    export let helpClass = '';
    export let uid;

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
        float: right;
        position: relative;
        top: 4px;
    }
    .help-icon {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 1.3em;
        height: 1.3em;
        border-radius: 50%;
        border: 1px solid #ddd;
        background: transparent;
        text-align: center;
        color: #a5a5a5;
        font-weight: 700;
        font-size: 12px;
        cursor: default;
    }
    .help-icon:hover {
        background: #18a1cd;
        border: 1px solid #18a1cd;
        color: #f9f9f9;
    }
    .hat-icon {
        font-size: 16px;
        color: #fff;
        position: absolute;
        left: -15px;
        top: 12px;
    }
    .content {
        position: absolute;
        z-index: 1000;
        top: -8px;
        left: -5px;
        padding: 8px;
        text-indent: 25px;
        background: #18a1cd;
        color: #fff;
        width: 240px;
        border-radius: 3px;
        box-shadow: 3px 2px 2px rgba(0, 0, 0, 0.1);
    }
    .content :global(img) {
        max-width: none;
    }
    .content :global(a) {
        color: white;
        text-decoration: underline;
    }
</style>

<div
    class="help {helpClass}"
    on:mouseenter={handleHelpMouseenter}
    on:mouseleave={handleHelpMouseleave}
    data-uid={uid}
>
    <span class="help-icon">?</span>
    {#if visible}
        <div class="content">
            <i class="hat-icon im im-graduation-hat" />
            <slot />
        </div>
    {/if}
</div>
