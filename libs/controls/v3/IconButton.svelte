<script>
    import IconDisplay from './IconDisplay.svelte';

    export let title;
    export let active = false;
    export let icon;
    export let iconLeft = false;
    export let iconColor;
    export let assetURL;

    let renderedIconColor;

    function getRenderedIconColor() {
        if (iconLeft && iconColor) return iconColor;
        else if (iconLeft) return active ? '#333' : '#858585';
        return active ? '#333' : '#1d81a2';
    }

    $: renderedIconColor = getRenderedIconColor();
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

    span {
        display: block;
        padding-top: 8px;
        font-size: 12px;
        line-height: 16px;
    }

    .icon-left {
        flex-direction: row;
        text-align: left;
        min-height: auto;
        padding: 10px;
        color: #333;
        font-size: 12px;
        font-weight: 500;
        background: #f5f5f5;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.02), inset 0 1px 0 #cccccc, inset 1px 0 0 #cccccc,
            inset -1px 0 0 #cccccc, inset 0 -1px 0 #b3b3b3;
    }

    .icon-left:hover,
    .icon-left.active {
        background: #f5f5f5;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), inset 0 2px 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.02), inset 0 1px 0 #cccccc,
            inset 1px 0 0 #cccccc, inset -1px 0 0 #cccccc, inset 0 -1px 0 #b3b3b3;
    }

    .icon-left span {
        font-family: 'Roboto Medium', 'Roboto', sans-serif;
        margin-left: 10px;
        padding-top: 0;
    }
</style>

<button class:active class:icon-left={iconLeft} on:click>
    <IconDisplay {assetURL} {icon} size="32px" color={renderedIconColor} />
    <span>{title}</span>
</button>
