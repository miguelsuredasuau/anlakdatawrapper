<script>
    import { beforeUpdate } from 'svelte';
    import { currentFolder, query, chartsLoading } from './stores';
    import debounce from 'lodash/debounce';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';

    $: searchFolder = $query.search
        ? {
              id: null,
              key: '%%search%%',
              level: 0,
              teamId: null,
              search: $query.search,
              name: __('archive / search-results', 'core', { s: $query.search }),
              path: '/archive'
          }
        : null;

    export let __;

    let value;
    let _prevQuery;
    let _prevFolder;

    const onInput = debounce(() => {
        $query = { ...$query, search: value };
    }, 1000);

    let _prevSelectedFolder = { ...$currentFolder };

    beforeUpdate(() => {
        if (_prevQuery !== $query.search) {
            _prevQuery = value = $query.search;
            if (searchFolder && searchFolder !== $currentFolder) {
                if ($currentFolder && !$currentFolder.search) {
                    // memorize previously selected folder
                    _prevSelectedFolder = $currentFolder;
                }
                $currentFolder = searchFolder;
            } else {
                // restore previous folder
                $currentFolder = _prevSelectedFolder;
            }
        }
        if (_prevFolder !== $currentFolder) {
            _prevFolder = $currentFolder;
            if (!$currentFolder.search) {
                value = _prevQuery = '';
                $query = { ...$query, search: value };
            }
        }
    });
</script>

<div class="control has-icons-left" class:is-loading={$chartsLoading}>
    <input class="input" type="text" bind:value on:input={onInput} placeholder={__('Search')} />
    <IconDisplay icon="search" size="18px" className="is-left" />
</div>
