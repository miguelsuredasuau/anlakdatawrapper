<script>
    import ModalDisplay from './ModalDisplay.svelte';
    import IconButton from './IconButton.svelte';
    import { createEventDispatcher } from 'svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';

    export let title = '';
    export let body = 'Do you want to proceed?';

    export let closeable = true;
    export let uid = 'confirmation-modal';

    export let yesOption = 'Yes';
    export let yesIcon = null;
    export let yesType = 'primary';

    export let noOption = 'No';
    export let noIcon = null;
    export let noType = null;

    const dispatch = createEventDispatcher();
</script>

<style>
    .box > .delete {
        position: absolute;
        top: 1rem;
        right: 1rem;
    }
</style>

<ModalDisplay maxWidth="40em" backgroundOpacity={0.8} open={true} closeable={false} {uid}>
    <div class="box pt-5 px-5 pb-4">
        {#if closeable}
            <button aria-label="close" class="delete" on:click={() => dispatch('cancel')} />
        {/if}
        {#if title}
            <h3 class="title is-4 mb-2" class:pr-4={closeable}>{@html purifyHtml(title)}</h3>
        {/if}
        <p class="is-size-5" class:pr-4={closeable && !title}>
            {@html purifyHtml(body)}
        </p>
        <hr class="my-4" />
        <div class="buttons is-justify-content-flex-end">
            {#if !!noOption}
                <IconButton
                    on:click={() => dispatch('cancel')}
                    class={noType ? `is-${noType}` : null}
                    icon={noIcon}
                    uid="{uid}-no"
                >
                    {noOption}
                </IconButton>
            {/if}
            <IconButton
                on:click={() => dispatch('confirm')}
                class={yesType ? `is-${yesType}` : null}
                icon={yesIcon}
                uid="{uid}-yes"
            >
                {yesOption}
            </IconButton>
        </div>
    </div>
</ModalDisplay>
