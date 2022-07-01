<script>
    import IconDisplay from './IconDisplay.svelte';

    let className;

    export { className as class };
    export let icon;
</script>

<button on:click class="button {className}">
    {#if icon}<IconDisplay {icon} />{/if} <span><slot /></span>
</button>
