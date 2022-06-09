<script>
    import ConfirmationModal from '../ConfirmationModal.svelte';

    let refConfirmationModal;
</script>

<ConfirmationModal
    bind:this={refConfirmationModal}
    on:confirm={() => console.warn('Implement confirmation!')}
    on:dismiss={() => console.warn('Implement dismissal!')}
    isOpen
    confirmButtonIcon="checkmark-bold"
>
    <p>Some explanation text about the confirmation modal.</p>
</ConfirmationModal>

<button on:click={refConfirmationModal.open()}>Open modal</button>
