<script>
    import { onMount } from 'svelte';
    export let id = null;
    let div = null;
    onMount(() => {
        if (id === '') return;
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `/preview/${id}/embed.js`;
        div.appendChild(script);
    });
</script>

<div bind:this={div} />
