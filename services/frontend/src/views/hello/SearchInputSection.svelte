<script type="text/javascript">
    import SearchInput from '_partials/controls/SearchInput.svelte';
    export let __;
    let value = '';
    let results = 0;

    function onSearch({ done }) {
        results = 0;
        setTimeout(() => {
            results = Math.round(Math.random() * 100);
            done();
        }, 1000);
    }
</script>

<div class="section pl-0 pt-0">
    <h3 id="search" class="title is-3">Search</h3>
    <div style="max-width: 400px">
        <SearchInput {__} bind:value onInput={onSearch} />
    </div>
    {#if results}
        <p class="mt-2 has-text-grey">Found {results} results!</p>
    {/if}
</div>
