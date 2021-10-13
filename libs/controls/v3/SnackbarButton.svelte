<script>
    export let uid;
    export let title = null;
</script>

<style>
    button {
        display: block;
        margin: 0;
        border: 0;
        border-left: 1px solid rgba(0, 0, 0, 0.3);
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 7px;
        padding-bottom: 8px;
        font-size: 14px;
        line-height: 20px;
        font-weight: bold;
        color: #fff;
        background: #1d81a2;
        opacity: 0.9;
        cursor: pointer;
    }
    button:hover {
        opacity: 1;
    }
    button:first-child {
        border-left: 0;
        padding-left: 20px;
        border-top-left-radius: 17.5px;
        border-bottom-left-radius: 17.5px;
    }
    button:last-child {
        padding-right: 20px;
        border-top-right-radius: 17.5px;
        border-bottom-right-radius: 17.5px;
    }
    button :global(i) {
        padding-right: 0.3em;
    }
    button :global(svg) {
        vertical-align: -0.15em;
    }
</style>

<button data-uid={uid} {title} on:click><slot /></button>
