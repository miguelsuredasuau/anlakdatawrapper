<script type="text/javascript">
    import SearchInput from '_partials/controls/SearchInput.svelte';
    export let __;
    let value = '';
    let results = 0;

    function onSearch(event) {
        results = 0;
        setTimeout(() => {
            results = Math.round(Math.random() * 100);
            event.detail.done();
        }, 1000);
    }
</script>

<div class="section pl-0 pt-0">
    <h3 id="search" class="title is-3">Set Password</h3>
    <div style="max-width: 400px">
        <SearchInput {__} bind:value on:search={onSearch} />
    </div>
    {#if results}
        <p class="mt-2 has-text-grey">Found {results} results!</p>
    {/if}
</div>
