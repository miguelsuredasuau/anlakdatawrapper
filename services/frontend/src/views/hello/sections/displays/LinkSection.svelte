<script>
    import Link from '_partials/displays/Link.svelte';
</script>

<div class="section pl-0 pt-0">
    <h3 class="title is-3" id="save">Link Buttons</h3>
    <p class="subtitle is-5">featuring progress, success, and error states</p>
    <div class="columns is-multiline">
        <div class="column is-full">
            <Link href="https://example.com" target="_blank">Link</Link>
        </div>
        <div class="column is-full">
            <Link on:click={() => alert('Oh, hello there.')}>Button</Link>
        </div>
        <div class="column is-full">
            <Link disabled>Disabled</Link>
        </div>

        <div class="column is-full">
            <Link underline="hover">Underline on hover</Link>
        </div>
        <div class="column is-full">
            <Link underline={false}>No underline at all</Link>
        </div>
        <div class="column is-full">
            <Link icon="add">With icon prop</Link>
        </div>
        <div class="column is-full">
            <Link icon="add" class="is-size-4" underline="hover"
                >With custom class, icon prop and underline on hover</Link
            >
        </div>
    </div>
</div>
