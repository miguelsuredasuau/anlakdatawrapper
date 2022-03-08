<script>
    import SaveButtonDisplay from '_partials/displays/SaveButtonDisplay.svelte';

    let inProgress1 = false;
    let res1 = null;

    async function handleClick1() {
        inProgress1 = true;
        res1 = null;
        await delay(2000);
        inProgress1 = false;
        res1 = 'success';
    }

    let inProgress2 = false;
    let res2 = null;

    async function handleClick2() {
        inProgress2 = true;
        res2 = null;
        await delay(3000);
        inProgress2 = false;
        res2 = 'error';
    }

    let inProgress3 = false;
    let res3 = null;

    async function handleDelete() {
        inProgress3 = true;
        res3 = null;
        await delay(3000);
        inProgress3 = false;
        res3 = 'success';
    }

    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
</script>

<div class="section pl-0 pt-0">
    <h3 class="title is-3" id="save">Save Buttons</h3>
    <p class="subtitle is-5">featuring progress, success, and error states</p>
    <div class="buttons">
        <SaveButtonDisplay
            on:click={handleClick1}
            inProgress={inProgress1}
            bind:result={res1}
            icon="export-file"
            className="is-primary"
            inProgressLabel="it's happening..."
            successLabel="It is done!"
            errorLabel="It went wrong"
            label="Do some action!"
        />
        <SaveButtonDisplay
            on:click={handleClick2}
            inProgress={inProgress2}
            bind:result={res2}
            icon="export-file"
            inProgressLabel="it's happening..."
            successLabel="It is done!"
            errorLabel="It went wrong"
            label="This may fail!"
        />
        <SaveButtonDisplay
            on:click={handleDelete}
            inProgress={inProgress3}
            bind:result={res3}
            icon="trash"
            className="is-danger"
            inProgressLabel="deleting..."
            successLabel="Deleted!"
            errorLabel="Still there"
            label="Delete"
        />
    </div>
</div>
