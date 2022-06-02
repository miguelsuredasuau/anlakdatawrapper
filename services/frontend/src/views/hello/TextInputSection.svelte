<script>
    import HorizontalFormFieldDisplay from '_partials/displays/HorizontalFormFieldDisplay.svelte';
    import TextInput from '_partials/controls/TextInput.svelte';
    import TextAreaInput from '_partials/controls/TextAreaInput.svelte';

    let value = 'Lorem ipsum dolor sit';
</script>

<div class="section pl-0 pt-0">
    <div class="columns">
        <div class="column is-half">
            <h3 class="title is-3">TextInput</h3>
            <HorizontalFormFieldDisplay label="default" compact>
                <TextInput bind:value />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="disabled" compact>
                <TextInput bind:value disabled />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="expandable" compact>
                <TextInput bind:value expandable />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="placeholder" compact>
                <TextInput placeholder="Please enter text" />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="right-to-left" compact>
                <TextInput bind:value textDirection="rtl" />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="error" compact>
                <TextInput bind:value error />
            </HorizontalFormFieldDisplay>
        </div>

        <div class="column is-half">
            <h3 class="title is-3">TextAreaInput</h3>
            <HorizontalFormFieldDisplay label="default" compact>
                <TextAreaInput bind:value />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="disabled" compact>
                <TextAreaInput bind:value disabled />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="placeholder" compact>
                <TextAreaInput placeholder="Please enter text" />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="right-to-left" compact>
                <TextAreaInput bind:value textDirection="rtl" />
            </HorizontalFormFieldDisplay>

            <HorizontalFormFieldDisplay label="error" compact>
                <TextAreaInput bind:value error />
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
