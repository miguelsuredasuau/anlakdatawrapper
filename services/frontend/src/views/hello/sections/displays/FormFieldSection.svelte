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

                <FormFieldDisplay {__} message="Normal message" label="Normal message" {compact}>
                    <input type="text" class="input" />
                </FormFieldDisplay>

                <FormFieldDisplay
                    {__}
                    message="This looks very good"
                    messageType="success"
                    label="Success message"
                    {compact}
                >
                    <input type="text" class="input is-success" />
                </FormFieldDisplay>

                <FormFieldDisplay
                    {__}
                    message="This is some info message"
                    messageType="info"
                    label="Info message"
                    {compact}
                >
                    <input type="text" class="input is-info" />
                </FormFieldDisplay>

                <FormFieldDisplay
                    {__}
                    message="This looks good"
                    error="Something went wrong"
                    label="Error message"
                    {compact}
                >
                    <input type="text" class="input is-danger" />
                </FormFieldDisplay>

                <FormFieldDisplay {__} label="disabled" {compact}>
                    <input type="text" class="input" disabled />
                </FormFieldDisplay>

                <FormFieldDisplay
                    {__}
                    tooltip="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                    label="with tooltip"
                    {compact}
                >
                    <input type="text" class="input" placeholder="tooltip tooltip tooltip" />
                </FormFieldDisplay>

                <FormFieldDisplay {__} label="with tooltip slot" {compact}>
                    <svelte:fragment slot="tooltip">
                        <b>Lorem ipsum dolor</b> sit amet, consectetur adipiscing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                    </svelte:fragment>
                    <input type="text" class="input" placeholder="tooltip tooltip tooltip" />
                </FormFieldDisplay>
            </div>
        {/each}
    </div>
</div>
