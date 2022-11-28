<script>
    import ModalDisplay from './ModalDisplay.svelte';
    import IconButton from './IconButton.svelte';
    import { createEventDispatcher } from 'svelte';

    export let title = 'Title';
    export let body = 'Body';

    export let closeable = true;
    export let uid = 'actions-modal';

    export let primaryOption = 'Primary';
    export let primaryIcon = null;

    export let secondaryOption = 'Secondary';
    export let secondaryIcon = null;

    export let backOption = 'Back';

    const dispatch = createEventDispatcher();

    const dismiss = () => dispatch('cancel');
    const primaryAction = () => dispatch('primary');
    const secondaryAction = () => dispatch('secondary');
</script>

<style>
    .box > .delete {
        position: absolute;
        top: 1rem;
        right: 1rem;
    }
</style>

<ModalDisplay maxWidth="40em" open {uid} on:close={dismiss}>
    <div class="box pt-5 px-5 pb-4">
        {#if closeable}
            <button aria-label="close" class="delete" on:click={dismiss} />
        {/if}

        {#if title}
            <h3 class="title is-4 mb-2" class:pr-4={closeable}>{title}</h3>
        {/if}

        <p class="is-size-5" class:pr-4={closeable && !title}>
            {body}
        </p>

        <hr class="my-4" />

        <div class="buttons is-justify-content-space-between">
            <button class="button" data-uid="{uid}-back" on:click={dismiss}>
                {backOption}
            </button>

            <div class="buttons">
                {#if secondaryOption}
                    <IconButton
                        on:click={secondaryAction}
                        icon={secondaryIcon}
                        uid="{uid}-secondary"
                    >
                        {secondaryOption}
                    </IconButton>
                {/if}
                <IconButton
                    on:click={primaryAction}
                    icon={primaryIcon}
                    uid="{uid}-primary"
                    class="is-primary"
                >
                    {primaryOption}
                </IconButton>
            </div>
        </div>
    </div>
</ModalDisplay>
