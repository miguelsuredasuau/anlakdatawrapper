<script>
    import { beforeUpdate, getContext } from 'svelte';
    import { searchQuery, currentFolder } from './stores';
    import debounce from 'lodash/debounce';

    const request = getContext('request');
    const { findFolderByPath } = getContext('page/archive');

    $: searchFolder = $searchQuery
        ? {
              id: null,
              teamId: null,
              search: $searchQuery,
              name: `Search results for "${$searchQuery}"`,
              path: `/archive?search=${encodeURIComponent($searchQuery)}`
          }
        : null;

    export let __;

    let value;
    let _prevQuery;
    let _prevFolder;

    $searchQuery = value = $request.query ? $request.query.search : null;

    const onInput = debounce(() => {
        $searchQuery = value;
    }, 1000);

    let _prevSelectedFolder = findFolderByPath($request.path, {});

    beforeUpdate(() => {
        if (_prevQuery !== $searchQuery) {
            _prevQuery = value = $searchQuery;
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
                $searchQuery = value = _prevQuery = '';
            }
        }
    });
</script>

<style>
    .icon i {
        font-size: 1.3em;
        position: relative;
        top: 2px;
    }
</style>

<div class="control has-icons-left">
    <span class="icon has-text-grey-dark is-small is-left">
        <i class="im im-magnifier" />
    </span>
    <input class="input" type="text" bind:value on:input={onInput} placeholder={__('Search')} />
</div>
