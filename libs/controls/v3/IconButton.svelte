<script>
    export let icon;
    export let title;
    export let active = false;
</script>

<style>
    button {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        min-height: 80px;
        margin: 0;
        border: 0;
        padding: 15px 20px;
        box-sizing: border-box;
        overflow: hidden;
        color: #1d81a2;
        background: transparent;
        text-align: center;
        cursor: pointer;
    }

    button:hover,
    button.active {
        background: #fff;
        border-radius: 4px;
    }

    button.active {
        color: #222;
        cursor: default;
    }

    i {
        display: block;
        font-size: 24px !important;
    }

    span {
        display: block;
        padding-top: 8px;
        font-size: 12px;
        line-height: 15px;
    }
</style>

<button class:active on:click>
    <i class={icon} />
    <span>{title}</span>
</button>
