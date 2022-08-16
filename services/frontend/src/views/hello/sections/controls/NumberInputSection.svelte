<script>
    import HorizontalFormFieldDisplay from '_partials/displays/HorizontalFormFieldDisplay.svelte';
    import NumberInput from '_partials/controls/NumberInput.svelte';

    let value = 42;
</script>

<div class="section pl-0 pt-0">
    <div class="columns">
        <div class="column is-half">
            <h3 class="title is-3">NumberInput</h3>
            <HorizontalFormFieldDisplay label="default" compact>
                <NumberInput bind:value />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="minimum 0" compact>
                <NumberInput bind:value min={0} max={100} />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="min/max" compact>
                <NumberInput bind:value min={40} max={60} />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="placeholder" compact>
                <NumberInput placeholder="auto" />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="step size 0.1" compact>
                <NumberInput bind:value step={0.1} />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="fixed width" compact>
                <NumberInput bind:value width="80px" />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="disabled" compact>
                <NumberInput bind:value disabled />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="with unit" compact>
                <NumberInput bind:value unit="px" />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="no spinner" compact>
                <NumberInput bind:value spinner={false} />
            </HorizontalFormFieldDisplay>
        </div>
    </div>
</div>

<!-- 
export let value = '';
    export let id = '';
    export let uid = '';
    export let autocomplete = 'off';
    export let disabled = false;
    export let expandable = false;
    export let placeholder = '';
    export let width = '100%';
    export let height = 20;
    export let textDirection = 'ltr';
    export let error = false;
    export let rows = 5;


-->
