<script>
    import FormFieldDisplay from '_partials/displays/FormFieldDisplay.svelte';

    export let __;
</script>

<div class="section pl-0 pt-0">
    <h3 class="title is-3">FormFieldDisplay</h3>

    <div class="columns">
        {#each [false, true] as compact}
            <div class="column is-two-fifths">
                <h4 class="title is-4">{compact ? 'compact' : 'normal'}</h4>
                <FormFieldDisplay {__} {compact}>
                    <input type="text" value="without label" class="input" />
                </FormFieldDisplay>

                <FormFieldDisplay {__} label="With label" id="my-form-field" let:id {compact}>
                    <input type="text" class="input" {id} />
                </FormFieldDisplay>

                <FormFieldDisplay {__} label="In checked state" checked {compact}>
                    <input type="text" class="input" />
                </FormFieldDisplay>

                <FormFieldDisplay {__} label="Loading state" loading {compact}>
                    <input type="text" class="input" />
                </FormFieldDisplay>

                <FormFieldDisplay {__} error="My message" label="Error message" {compact}>
                    <input type="text" class="input is-danger" />
                </FormFieldDisplay>

                <FormFieldDisplay {__} label="disabled" {compact}>
                    <input type="text" class="input" disabled />
                </FormFieldDisplay>
            </div>
        {/each}
    </div>
</div>
