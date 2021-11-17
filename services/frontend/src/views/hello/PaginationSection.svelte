<script>
    import Pagination from '_partials/Pagination.svelte';

    let offset1 = 0;
    let offset2 = 0;
</script>

<div class="section pl-0 pt-0">
    <h3 id="pagination" class="title is-3">Pagination</h3>

    <div class="block">
        <Pagination changeOffset={v => (offset1 = v)} offset={offset1} total={1040} limit={50} />
    </div>
    <div class="block">
        <Pagination changeOffset={v => (offset2 = v)} offset={offset2} total={30} limit={10} />
    </div>
</div>
