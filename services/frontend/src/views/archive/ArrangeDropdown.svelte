<script>
    import Dropdown from '_partials/components/Dropdown.svelte';
    import SvgIcon from 'layout/partials/SvgIcon.svelte';
    import { formatQueryString } from '../../utils/url.cjs';
    import { query } from './stores';
    import { DEFAULT_SORT_ORDER } from './constants';

    export let __;
    export let apiQuery;

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
    let selectedArrangeOption = arrangeOptions.find(
        o => o.query && o.query.groupBy === apiQuery.groupBy && o.query.orderBy === apiQuery.orderBy
    );

    function reverseSortDirection() {
        $query = { ...$query, order: $query.order === 'ASC' ? 'DESC' : 'ASC' };
    }
</script>

<Dropdown bind:active={arrangeDropdownActive}>
    <button
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        class="button is-text has-text-grey-dark"
        style="text-decoration:none"
        slot="trigger"
        >{__('archive / sorted-by')}&nbsp;
        <b>{(selectedArrangeOption && selectedArrangeOption.title) || '...'}</b>
        <span class="p-3" on:click|preventDefault|stopPropagation={reverseSortDirection}
            ><SvgIcon size="20px" icon="arrow-{$query.order === 'ASC' ? 'down' : 'up'}" /></span
        ></button
    >
    <div class="dropdown-content" slot="content">
        {#each arrangeOptions as option (option.id)}
            {#if option.divider}
                <hr class="dropdown-divider" />
            {:else}
                <a
                    href={`/archive?${formatQueryString({
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
