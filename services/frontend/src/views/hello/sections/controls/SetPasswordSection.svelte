<script type="text/javascript">
    import SetPasswordInput from '_partials/controls/SetPasswordInput.svelte';
    export let __;
    let value = '';
</script>

<div class="section pl-0 pt-0">
    <h3 id="setpassword" class="title is-3">Set Password</h3>
    <div style="max-width: 400px">
        <SetPasswordInput {__} bind:value />
    </div>
</div>
