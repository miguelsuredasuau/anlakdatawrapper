<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let icon;
    export let title;
    export let accept;
    export let active = false;
</script>

<style>
    label {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
        position: relative;
        min-height: 80px;
        padding: 15px 20px;
        box-sizing: border-box;
        overflow: hidden;
        color: #1d81a2;
        text-align: center;
        cursor: pointer;
    }

    label:hover,
    label.active {
        background: #fff;
        border-radius: 4px;
    }

    label:focus-within {
        outline: 1px dotted #222;
    }

    label.active {
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
        font-weight: 400;
    }

    input {
        opacity: 0;
        position: absolute;
        z-index: -1;
    }
</style>

<label class:active on:click>
    <input type="file" {accept} on:change={event => dispatch('upload', event)} />
    <i class={icon} />
    <span>{title}</span>
</label>
