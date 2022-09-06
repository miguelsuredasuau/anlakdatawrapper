<script>
    import ModalDisplay from '../ModalDisplay.svelte';

    let modalRef;
</script>

<ModalDisplay
    title="ModalDisplay"
    isOpen
    bind:this={modalRef}
    on:dismiss={() => console.warn('Implement dismissal!')}
>
    <p slot="content">Some explanation text about the modal.</p>
    <svelte:fragment slot="actions">
        <button class="btn" on:click={modalRef.dismiss}>Action</button>
    </svelte:fragment>
</ModalDisplay>

<button on:click={modalRef.open}>Open modal</button>
