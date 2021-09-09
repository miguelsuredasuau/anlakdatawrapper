<script>
    import IconButton from './IconButton.svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let icon;
    export let title;
    export let accept;
    export let active = false;
</script>

<style>
    input {
        opacity: 0;
        position: absolute;
        z-index: 10;
        left: 0;
        top: 0;
        height: 100px;
        font-size: 80px;
    }
</style>

<IconButton {icon} {title} {active}>
    <input type="file" {accept} on:change={event => dispatch('upload', event)} />
</IconButton>
