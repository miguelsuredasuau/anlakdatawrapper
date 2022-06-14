<script>
    import MessageDisplay from '_partials/displays/MessageDisplay.svelte';
    import { getContext } from 'svelte';

    const userData = getContext('userData');

    export let title;
    export let userDataKey;

    function closeIntroduction() {
        $userData[userDataKey] = 'false';
    }

    $: showIntroduction = JSON.parse($userData[userDataKey] || 'true');
</script>

<style lang="scss">
    @import '../../../styles/export.scss';

    .controls-section {
        background: $background;
        border-radius: $radius;
        box-shadow: $shadow-border;
        color: $text;
    }
</style>

{#if showIntroduction}
    <div class="feature-introduction block">
        <MessageDisplay
            type="primary"
            visible={showIntroduction}
            {title}
            deletable
            on:delete={closeIntroduction}
        >
            <slot name="introduction" />
            <div class="controls-section mt-3 px-2">
                <slot name="controls" />
            </div>
        </MessageDisplay>
    </div>
{:else}
    <slot name="controls" />
{/if}
