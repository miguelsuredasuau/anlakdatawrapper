<script>
    import { beforeUpdate } from 'svelte';
    import { currentFolder, query } from './stores';
    import debounce from 'lodash/debounce';
    import SvgIcon from '../layout/partials/SvgIcon.svelte';

    $: searchFolder = $query.search
        ? {
              id: null,
              key: '%%search%%',
              level: 0,
              teamId: null,
              search: $query.search,
              name: __('archive / search-results').replace('%s', $query.search),
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

<style lang="scss">
    @import '../../styles/colors.scss';
    .control {
        :global(.icon) {
            bottom: 0;
            color: $dw-grey;
        }
    }
</style>

<div class="control has-icons-left">
    <input class="input" type="text" bind:value on:input={onInput} placeholder={__('Search')} />
    <SvgIcon icon="search" size="1.5em" className="is-left mx-2" />
</div>
