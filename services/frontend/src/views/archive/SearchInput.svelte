<script>
    import { beforeUpdate, getContext } from 'svelte';
    import { searchQuery, currentFolder } from './stores';
    import debounce from 'lodash/debounce';
    import SvgIcon from '../layout/partials/SvgIcon.svelte';

    const request = getContext('request');
    const { findFolderByPath } = getContext('page/archive');

    $: searchFolder = $searchQuery
        ? {
              id: null,
              key: '%%search%%',
              level: 0,
              teamId: null,
              search: $searchQuery,
              name: __('archive / search-results'.replace('%s', $searchQuery)),
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

<style lang="scss">
    @import '../../styles/colors.scss';
    :global(.icon) {
        color: $dw-grey-dark;
    }
</style>

<div class="control has-icons-left">
    <SvgIcon icon="search" size="1.5em" />
    <input class="input" type="text" bind:value on:input={onInput} placeholder={__('Search')} />
</div>
