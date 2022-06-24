<script type="text/javascript">
    import SwitchControl from '_partials/controls/SwitchControl.svelte';
    import CheckboxInput from '_partials/controls/CheckboxInput.svelte';

    let value = true;
    let indeterminate = true;
    let disabled = true;

    function reset() {
        value = true;
        indeterminate = true;
        disabled = true;
    }
</script>

<div class="section pl-0 pt-0">
    <h3 id="switch" class="title is-3">Switch Controls</h3>
    <div class="columns">
        <div class="column">
            <SwitchControl bind:value label="switch with label" />
            <SwitchControl
                bind:value
                label="switch with content"
                tooltip="This happens if you have both tooltip attribute and tooltip slot"
                tooltipType="upgrade"
            >
                <svelte:fragment slot="tooltip">
                    <h2 class="title is-5">I'm in the slot</h2>
                </svelte:fragment>
                <div class="content">
                    <h3>Hello world!</h3>
                    <p>This content is shown if the Switch is enabled</p>
                </div>
            </SwitchControl>
            <SwitchControl bind:value inverted label="inverted switch" />
            <SwitchControl bind:value bind:indeterminate label="indeterminate switch" />
            <SwitchControl
                bind:value
                label="switch with help"
                tooltip="This is a little help text explaining this switch"
            />
        </div>
        <div class="column">
            <div class="block">
                <SwitchControl bind:value {disabled} label="disabled switch" />
                <SwitchControl bind:value {disabled} disabledState="on" label="disabledState on" />
                <SwitchControl
                    bind:value
                    {disabled}
                    disabledState="off"
                    label="disabledState false"
                />
                <SwitchControl
                    bind:value
                    {disabled}
                    disabledMessage="This message is only shown if the Switch is disabled (to explain why it's disabled)"
                    label="disabledMessage false"
                />
            </div>
            <div class="block pl-2">
                <CheckboxInput bind:value={disabled} label="disable switches" />
            </div>
        </div>

        <div class="column">
            <pre class="mb-2">{JSON.stringify({ value, indeterminate, disabled }, null, 2)}</pre>
            <button class="button" on:click={reset}>reset</button>
        </div>
    </div>
</div>
