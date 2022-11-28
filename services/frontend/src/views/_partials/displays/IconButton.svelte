<script>
    import IconDisplay from './IconDisplay.svelte';

    let className;

    export { className as class };
    export let icon;
    export let uid;
</script>

<button on:click class="button {className}" data-uid={uid}>
    {#if icon}<IconDisplay {icon} />{/if} <span><slot /></span>
</button>
