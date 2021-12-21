<script>
    import FormField from '_partials/controls/FormField.svelte';

    export let __;
</script>

<div class="section pl-0 pt-0">
    <h3 id="form-field" class="title is-3">Form Field</h3>

    <div class="columns">
        <div class="column is-half">
            <h4 class="is-4 mb-3">Without label:</h4>
            <FormField {__}>
                <input type="text" class="input" />
            </FormField>

            <h4 class="is-4 mb-3">With label:</h4>
            <FormField {__} label="My label" id="my-form-field" let:id>
                <input type="text" class="input" {id} />
            </FormField>

            <h4 class="is-4 mb-3">In checked state:</h4>
            <FormField {__} checked={true}>
                <input type="text" class="input" />
            </FormField>

            <h4 class="is-4 mb-3">In loading state:</h4>
            <FormField {__} loading={true}>
                <input type="text" class="input" />
            </FormField>

            <h4 class="is-4 mb-3">With error:</h4>
            <FormField {__} error="My message">
                <input type="text" class="input" />
            </FormField>
        </div>
    </div>
</div>
