<script>
    import HorizontalFormFieldDisplay from '_partials/displays/HorizontalFormFieldDisplay.svelte';
    import IconDisplay from '_partials/displays/IconDisplay.svelte';
    import RadioInput from '_partials/controls/RadioInput.svelte';
    import CheckboxInput from '_partials/controls/CheckboxInput.svelte';

    export let __;

    const options = [1, 2, 3, 4, 5].map(i => ({ value: i, label: `Item ${i}` }));

    let radioValue = 1;
</script>

<style>
    .my-custom-tooltip h2 {
        color: var(--color-dw-scooter-light);
    }
</style>

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

                <HorizontalFormFieldDisplay {__} label="Checked" checked {compact}>
                    <input type="text" class="input" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay {__} label="Loading state" loading {compact}>
                    <input type="text" class="input" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay
                    {__}
                    label="with tooltip"
                    tooltip="Lorem ipsum <b>dolor sit amet</b>, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                    {compact}
                >
                    <input type="text" class="input" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay {__} label="with slot tooltip" {compact}>
                    <div class="my-custom-tooltip" slot="tooltip">
                        <h2 class="title is-4">Lorem ipsum dolor</h2>
                        <IconDisplay icon="dw-chart" />
                        <p>
                            sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                    </div>
                    <input type="text" class="input" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay
                    {__}
                    label="upgrade info"
                    tooltipType="upgrade"
                    tooltip="Hello world"
                    {compact}
                >
                    <input type="text" class="input" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay
                    {__}
                    error="Something went wrong. Also this is a very long and unnecessarily verbose error message."
                    label="Error"
                    {compact}
                >
                    <input type="text" class="input is-danger" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay
                    {__}
                    message="<b>Caution!</b> Something needs your attention"
                    messageType="warning"
                    label="Warning"
                    {compact}
                >
                    <input type="text" class="input" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay
                    {__}
                    message="Well done! This looks <b>very</b> good."
                    messageType="success"
                    label="Success"
                    {compact}
                >
                    <input type="text" class="input is-success" />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay {__} label="disabled" {compact}>
                    <input type="text" class="input" disabled />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay
                    {__}
                    label="checkbox"
                    labelPadding="off"
                    tooltip="You need to set labelPadding to 'off' in case of checkbox and radio inputs."
                    {compact}
                >
                    {#each options as option}
                        <CheckboxInput label={option.label} value={radioValue === option.value} />
                    {/each}
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay
                    {__}
                    label="radio (inline)"
                    labelPadding="none"
                    {compact}
                >
                    <RadioInput bind:value={radioValue} {options} />
                </HorizontalFormFieldDisplay>

                <HorizontalFormFieldDisplay {__} label="radio" labelPadding="none" {compact}>
                    <RadioInput bind:value={radioValue} {options} inline={false} />
                </HorizontalFormFieldDisplay>
            </div>
        {/each}
    </div>
</div>
