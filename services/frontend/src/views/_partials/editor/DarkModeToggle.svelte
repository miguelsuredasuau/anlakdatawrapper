<script>
    import ToolbarItem from './ToolbarItem.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { createEventDispatcher, getContext } from 'svelte';
    import get from '@datawrapper/shared/get.js';

    const { isDark, chart, theme } = getContext('page/edit');
    const dispatch = createEventDispatcher();

    export let __;

    $: uiMode =
        get($chart, 'metadata.custom.webToPrint.mode', 'web') === 'print' ||
        get($theme, 'data.type', 'web') === 'print'
            ? 'print'
            : 'web';

    function toggle() {
        $isDark = !$isDark;
    }

    function toLayoutTab() {
        dispatch('change-tab', 'layout');
    }
</script>

<style>
    .button.is-selected :global(.icon) {
        color: var(--color-dw-orange);
    }
</style>

{#if uiMode === 'web'}
    <ToolbarItem title={__('darkmode / caption-short')} tooltipPlacement="left">
        <div slot="tooltip" on:click={toLayoutTab}>
            {@html __('darkmode / note')}
        </div>
        <div class="field has-addons buttons are-outlined">
            <div class="control">
                <button
                    on:click={toggle}
                    class="button is-small is-outlined is-dark"
                    class:is-selected={!$isDark}
                >
                    <IconDisplay icon="sun" className="mx-0" />
                </button>
            </div>
            <div class="control">
                <button
                    id="dark-mode"
                    on:click={toggle}
                    class="button is-small is-outlined is-dark"
                    class:is-selected={$isDark}
                >
                    <IconDisplay icon="moon" className="mx-0" />
                </button>
            </div>
        </div>
    </ToolbarItem>
{/if}
