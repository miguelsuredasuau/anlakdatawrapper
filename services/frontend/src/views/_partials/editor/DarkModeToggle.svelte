<script>
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
    .dark-mode-toggle {
        max-width: 10em;
    }
    .button :global(.icon) {
        color: var(--color-dw-grey-light);
    }
    .button.is-active :global(.icon) {
        color: var(--color-dw-orange);
    }
</style>

<div class="dark-mode-toggle">
    <label for="dark-mode">{__('darkmode / caption')}</label>

    <div class="buttons has-addons">
        <button on:click={toggle} class="button" class:is-active={!$isDark}>
            <IconDisplay icon="sun" />
        </button>
        <button id="dark-mode" on:click={toggle} class="button" class:is-active={$isDark}>
            <IconDisplay icon="moon" />
        </button>
    </div>
    <div class="toolbar-note" on:click={toLayoutTab}>
        {@html __('darkmode / note')}
    </div>
</div>
