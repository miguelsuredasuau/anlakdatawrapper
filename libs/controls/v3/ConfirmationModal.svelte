<script>
    import ModalDisplay from './ModalDisplay.svelte';
    import IconDisplay from './IconDisplay.svelte';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let isOpen = false;
    export let title = 'Title';
    export let confirmButtonText = 'Confirm';
    export let backButtonText = 'Back';
    export let confirmButtonIcon = false;
    export let uid;

    export const open = () => (isOpen = true);
    export const dismiss = () => {
        isOpen = false;
        dispatch('dismiss');
    };

    const confirm = () => {
        isOpen = false;
        dispatch('confirm');
    };
</script>

<style>
    .btn {
        padding-left: 25px;
        padding-right: 25px;
    }

    .back {
        font-weight: bold;
    }
</style>

<ModalDisplay bind:isOpen {title} {uid} on:dismiss>
    <svelte:fragment slot="content">
        <slot />
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <button class="btn back" data-uid={uid && `${uid}-back`} on:click={dismiss}>
            {backButtonText}
        </button>
        <button class="btn btn-danger" data-uid={uid && `${uid}-confirm`} on:click={confirm}>
            {#if confirmButtonIcon}
                <IconDisplay icon={confirmButtonIcon} class="mr-1" size="1.3em" valign="-0.3em" />
            {/if}
            {confirmButtonText}
        </button>
    </svelte:fragment>
</ModalDisplay>
