<script>
    import HorizontalFormFieldDisplay from '_partials/displays/HorizontalFormFieldDisplay.svelte';

    export let __;
</script>

<div class="section pl-0 pt-0">
    <h3 class="title is-3">HorizontalFormFieldDisplay</h3>

    <div class="columns">
        {#each [false, true] as compact}
            <div class="column is-two-fifths">
                <h4 class="title is-4">{compact ? 'compact' : 'normal'}</h4>

                <HorizontalFormFieldDisplay
                    {__}
                    label="With label"
                    id="my-form-field"
                    let:id
                    {compact}
                >
                    <input type="text" class="input" {id} />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay {__} label="In checked state" checked {compact}>
                    <input type="text" class="input" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay {__} label="Loading state" loading {compact}>
                    <input type="text" class="input" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay {__} label="with help" help="Hello world" {compact}>
                    <input type="text" class="input" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay {__} error="My message" label="Error message" {compact}>
                    <input type="text" class="input is-danger" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay {__} label="disabled" {compact}>
                    <input type="text" class="input" disabled />
                </HorizontalFormFieldDisplay>
            </div>
        {/each}
    </div>
</div>
