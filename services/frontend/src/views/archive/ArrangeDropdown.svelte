<script>
    import Dropdown from '_partials/Dropdown.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { query, currentFolder } from './stores';
    import { DEFAULT_SORT_ORDER } from './constants';

    export let __;
    export let apiQuery;

    function makeQuery(params) {
        return new URLSearchParams(params);
    }

    const arrangeOptions = [
        {
            id: 'lastModifiedAt',
            query: {
                groupBy: null,
                order: DEFAULT_SORT_ORDER.lastModifiedAt,
                orderBy: 'lastModifiedAt'
            },
            title: __('mycharts / Last edit time')
        },
        {
            id: 'createdAt',
            query: { groupBy: null, order: DEFAULT_SORT_ORDER.createdAt, orderBy: 'createdAt' },
            title: __('mycharts / Creation time')
        },
        {
            id: 'publishedAt',
            query: { groupBy: null, order: DEFAULT_SORT_ORDER.publishedAt, orderBy: 'publishedAt' },
            title: __('mycharts / Publish time')
        },
        { id: 'divider', divider: true },
        {
            id: 'title',
            query: { groupBy: null, order: DEFAULT_SORT_ORDER.title, orderBy: 'title' },
            title: __('mycharts / Title')
        },
        {
            id: 'status',
            query: {
                groupBy: 'status',
                order: DEFAULT_SORT_ORDER.lastEditStep,
                orderBy: 'lastEditStep'
            },
            title: __('mycharts / Status')
        },
        {
            id: 'author',
            query: { groupBy: 'author', order: DEFAULT_SORT_ORDER.authorId, orderBy: 'authorId' },
            title: __('mycharts / Author')
        }
    ];
    let arrangeDropdownActive = false;
    $: forcedArrangeOption = $currentFolder.forceOrder
        ? arrangeOptions.find(o => o.id === $currentFolder.forceOrder.orderBy)
        : null;
    let selectedArrangeOption = arrangeOptions.find(
        o => o.query && o.query.groupBy === apiQuery.groupBy && o.query.orderBy === apiQuery.orderBy
    );

    function reverseSortDirection() {
        $query = { ...$query, order: $query.order === 'ASC' ? 'DESC' : 'ASC' };
    }
</script>

<Dropdown disabled={$currentFolder.forceOrder} bind:active={arrangeDropdownActive}>
    <button
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        class="button is-text"
        slot="trigger"
        disabled={$currentFolder.forceOrder}
        >{__('archive / sorted-by')}&nbsp;
        {#if forcedArrangeOption}<b>{forcedArrangeOption.title}</b><span class="pl-2"
                ><IconDisplay
                    size="20px"
                    icon="arrow-{$currentFolder.forceOrder.order === 'ASC' ? 'down' : 'up'}"
                /></span
            >{:else}
            <b>{(selectedArrangeOption && selectedArrangeOption.title) || '...'}</b>
            <span class="pl-2" on:click|preventDefault|stopPropagation={reverseSortDirection}
                ><IconDisplay
                    size="20px"
                    icon="arrow-{$query.order === 'ASC' ? 'down' : 'up'}"
                /></span
            >{/if}</button
    >
    <div class="dropdown-content" slot="content">
        {#each arrangeOptions as option (option.id)}
            {#if option.divider}
                <hr class="dropdown-divider" />
            {:else}
                <a
                    href={`/archive?${makeQuery({
                        ...$query,
                        ...option.query
                    })}`}
                    class="dropdown-item"
                    class:is-active={selectedArrangeOption === option}
                    on:click|preventDefault={() => {
                        $query = { ...$query, ...option.query };
                        selectedArrangeOption = option;
                        arrangeDropdownActive = false;
                    }}>{option.title}</a
                >
            {/if}
        {/each}
    </div>
</Dropdown>
