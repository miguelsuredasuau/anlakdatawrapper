<script>
    import range from 'lodash/range';

    /**
     * @param {number} total
     * total number of items to paginate
     */
    export let total;

    /**
     * @param {number} limit
     *
     * numbers of items displayed per page
     */
    export let limit;

    /**
     * @param {number} offset
     * index of the first item displayed
     */
    export let offset;

    /**
     * @param {function} changeOffset
     * allows implementing custom behavior when the offset
     * changed, i.e. call an API
     */
    export let changeOffset = newOffset => {
        offset = newOffset;
    };

    $: curPage = Math.ceil(+offset / +limit) || 0;
    $: numPages = Math.ceil(total / limit) || 1;
    $: lastPage = numPages - 1;

    function gotoPage(page) {
        changeOffset(page * limit);
    }

    $: allPages = range(0, numPages);

    $: centerPages = allPages.slice(
        Math.max(curPage - 2, 0),
        Math.min(lastPage + 1, Math.max(5, curPage + 3))
    );
</script>

{#if numPages > 1}
    <nav class="pagination" aria-label="pagination">
        <ul class="pagination-list">
            {#if centerPages[0] > 0}
                <li>
                    <a
                        on:click|preventDefault={() => gotoPage(0)}
                        class="pagination-link"
                        href="#/page/1"
                        aria-label="Goto page 1">«</a
                    >
                </li>
            {/if}
            {#each centerPages as page}
                <li>
                    <a
                        class:is-current={page === curPage}
                        aria-label="Page {page + 1}"
                        href="#/page/{page + 1}"
                        on:click|preventDefault={() => gotoPage(page)}
                        class="pagination-link">{page + 1}</a
                    >
                </li>
            {/each}
            {#if centerPages[centerPages.length - 1] < lastPage}
                <li>
                    <a
                        on:click|preventDefault={() => gotoPage(lastPage)}
                        class="pagination-link"
                        href="#/page/{lastPage + 1}"
                        aria-label="Goto page {lastPage + 1}">»</a
                    >
                </li>
            {/if}
        </ul>
    </nav>
{/if}
