<script>
    import IconDisplay from './IconDisplay.svelte';

    export let title;
    export let active = false;
    export let icon;
    export let iconLeft = false;
    export let iconColor;
    export let assetURL;

    $: getRenderedIconColor = () => {
        if (iconLeft && iconColor) return iconColor;
        else if (iconLeft) return active ? '#333' : '#858585';
        return active ? '#333' : '#1d81a2';
    };

    $: renderedIconColor = getRenderedIconColor();
</script>

<style>
    button {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        margin: 0;
        position: relative;
        padding: 10px;
        box-sizing: border-box;
        overflow: hidden;
        color: #333;
        background: #f5f5f5;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        text-align: center;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.02), inset 0 1px 0 #cccccc, inset 1px 0 0 #cccccc,
            inset -1px 0 0 #cccccc, inset 0 -1px 0 #b3b3b3;
    }

    button:hover,
    button:active {
        background: #e6e6e6;
        color: #111;
    }

    button.active {
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), inset 0 2px 5px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.02), inset 0 1px 0 #cccccc,
            inset 1px 0 0 #cccccc, inset -1px 0 0 #cccccc, inset 0 -1px 0 #b3b3b3;
    }
    button:active {
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), inset 0 2px 5px rgba(0, 0, 0, 0.25), inset 0 2px 8px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.02), inset 0 1px 0 #cccccc, inset 1px 0 0 #cccccc, inset -1px 0 0 #cccccc, inset 0 -1px 0 #b3b3b3;
    }
    span {
        display: inline-block;
        font-size: 12px;
        line-height: 1.3;
        padding-top: 0.5em;
    }

    .icon-left {
        flex-direction: row;
        text-align: left;
        font-size: 12px;
    }

    .icon-left span {
        margin-left: 10px;
        padding-top: 0.1em;
    }
</style>

<button class:active class:icon-left={iconLeft} on:click>
    <slot />
    <IconDisplay {assetURL} {icon} size="32px" color={renderedIconColor} />
    <span>{title}</span>
</button>
