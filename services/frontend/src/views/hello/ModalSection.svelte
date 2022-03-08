<script>
    import ModalDisplay from '_partials/displays/ModalDisplay.svelte';

    let open = false;
    let open2 = false;
    let msg = '';

    function confirmed() {
        open = false;
        open2 = false;
        msg = 'You confirmed!';
        setTimeout(() => {
            msg = '';
        }, 1000);
    }

    function cancel() {
        open = false;
        open2 = false;
        msg = 'You cancelled';
        setTimeout(() => {
            msg = '';
        }, 1000);
    }
</script>

<ModalDisplay maxWidth="50em" closeable={false} bind:open>
    <div class="box has-background-white p-6">
        <h3 class="title is-2">Heads up!</h3>
        <p class="subtitle is-size-3 mb-5">This modal really needs your attention!</p>
        <div class="level">
            <div class="level-left">
                <button on:click={confirmed} class="button is-large is-primary">
                    Confirmed!
                </button>
            </div>
            <div class="level-right">
                <button on:click={cancel} class="button is-large">Back to safety</button>
            </div>
        </div>
    </div>
</ModalDisplay>

<ModalDisplay maxWidth="50em" closeable={true} bind:open={open2}>
    <p class="modal-card-title" slot="header">Heads up!</p>

    <p class="subtitle is-size-3 mb-5">This modal really needs your attention!</p>

    <div slot="footer">
        <div class="buttons">
            <button on:click={confirmed} class="button is-primary"> Confirmed! </button>
            <button on:click={cancel} class="button">Back to safety</button>
        </div>
    </div>
</ModalDisplay>

<div class="section pl-0 pt-0">
    <h3 id="modal" class="title is-3">Modals</h3>
    <div class="buttons">
        <button on:click={() => (open = true)} class="button is-large is-primary"
            >{msg || 'open modal!'}</button
        >
        <button on:click={() => (open2 = true)} class="button is-large is-primary"
            >{msg || 'open modal card!'}</button
        >
    </div>
</div>
