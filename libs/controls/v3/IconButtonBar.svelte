<script>
    export let uid;
</script>

<style>
    ul {
        display: flex;
        margin: 0 -5px;
        padding: 0;
        list-style: none;
    }

    ul > :global(li) {
        margin-bottom: 10px;
        padding: 0 5px;
        vertical-align: top;
    }
</style>

<ul data-uid={uid}>
    <slot />
</ul>
