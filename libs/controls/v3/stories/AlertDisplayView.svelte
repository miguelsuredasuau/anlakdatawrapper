<script>
    import AlertDisplay from '../AlertDisplay.svelte';
</script>

<style>
    h3 {
        margin-top: 2em;
    }
    h3:first-child {
        margin-top: 0;
    }
</style>

<h3>AlertDisplay: default (not specified), no close button</h3>

<AlertDisplay closeable={false} visible={true}>
    This is content inside a slot<br />
    This is content inside a slot<br />
    This is content inside a slot<br />
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a href="javascript:void(0)">Link</a>
</AlertDisplay>

<h3>AlertDisplay: info</h3>

<AlertDisplay type="info" visible={true} uid="alert-upload">
    You have uploaded <b>1</b> marker
    <br />
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a href="javascript:void(0)">Link</a>
</AlertDisplay>

<h3>AlertDisplay: success</h3>

<AlertDisplay type="success" visible={true}>
    You have uploaded <b>1</b> marker
    <br />
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a href="javascript:void(0)">Link</a>
</AlertDisplay>

<h3>AlertDisplay: warning</h3>

<AlertDisplay type="warning" visible={true}>
    Something went wrong with the request
    <br />
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a href="javascript:void(0)">Link</a>
</AlertDisplay>

<h3>AlertDisplay: error</h3>

<AlertDisplay type="error" visible={true} />

<h3>AlertDisplay: Upgrade information</h3>

<AlertDisplay type="upgrade-info" visible={true}>
    Oh no something is really bad :(
    <br />
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a href="javascript:void(0)">Link</a>
</AlertDisplay>

<h3>Multiple alerts</h3>

<AlertDisplay type="info" visible={true}>You have uploaded <b>1</b> marker</AlertDisplay>
<AlertDisplay type="warning" visible={true}>Something went wrong with the request</AlertDisplay>
<AlertDisplay type="error" visible={true}>Something went wrong with the request</AlertDisplay>

<h3>Multiple alerts, with custom margin</h3>

<AlertDisplay type="warning" visible={true} class="mb-1"
    >You have uploaded <b>1</b> marker</AlertDisplay
>
<AlertDisplay type="warning" visible={true} class="mb-3 ml-4"
    >You have uploaded <b>1</b> marker</AlertDisplay
>
<AlertDisplay type="warning" visible={true} class="mb-4 mx-4"
    >You have uploaded <b>1</b> marker</AlertDisplay
>
<AlertDisplay type="warning" visible={true} class="mt-1 mr-4"
    >Something went wrong with the request</AlertDisplay
>
