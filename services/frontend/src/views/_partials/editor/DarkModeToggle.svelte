<script>
    import ToolbarItem from './ToolbarItem.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import { createEventDispatcher, getContext } from 'svelte';

    const { isDark } = getContext('page/edit');
    const dispatch = createEventDispatcher();

    export let __;

    function toggle() {
        $isDark = !$isDark;
    }

    function toLayoutTab() {
        dispatch('change-tab', 'layout');
    }
</script>

<style>
    .button :global(.icon) {
        color: var(--color-dw-grey-light);
    }
    .button.is-selected :global(.icon) {
        color: var(--color-dw-orange);
    }
</style>

<ToolbarItem title={__('darkmode / caption')}>
    <div slot="tooltip" class="toolbar-note" on:click={toLayoutTab}>
        {@html __('darkmode / note')}
    </div>
    <div class="field has-addons">
        <div class="control">
            <button on:click={toggle} class="button is-small" class:is-selected={!$isDark}>
                <IconDisplay icon="sun" />
            </button>
        </div>
        <div class="control">
            <button
                id="dark-mode"
                on:click={toggle}
                class="button is-small"
                class:is-selected={$isDark}
            >
                <IconDisplay icon="moon" />
            </button>
        </div>
    </div>
</ToolbarItem>
