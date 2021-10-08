<script>
    import RadioControl from '../RadioControl.svelte';

    export let options;

    let value = 'red';

    const helpOptions = options.map(o => ({ ...o, help: `help balloon for <b>${o.label}</b>` }));
    const tooltipOptions = options.map(o => ({ ...o, tooltip: `help text for ${o.label}` }));
</script>

<RadioControl {options} label="stacked" bind:value inline={false} />
<RadioControl {options} label="inline" bind:value />
<RadioControl {options} indeterminate="1" label="indeterminate" value="" />
<RadioControl {options} label="short label" bind:value labelWidth="70px" />
<RadioControl {options} label="very, very long label" bind:value labelWidth="120px" />
<RadioControl
    {options}
    label="even longer label, breaks across lines"
    bind:value
    labelWidth="90px"
/>
<RadioControl
    options={[...options, ...options.reverse()]}
    label="many items"
    bind:value
    labelWidth="90px"
/>
<RadioControl
    {options}
    label="general help"
    help="Here you can get some help"
    bind:value
    labelWidth="90px"
/>
<RadioControl options={tooltipOptions} label="help tooltips" bind:value labelWidth="90px" />
<RadioControl options={helpOptions} label="help balloons" bind:value labelWidth="90px" />
<RadioControl {options} label="disabled" bind:value labelWidth="90px" disabled="1" />
<RadioControl
    {options}
    label="disabled message"
    bind:value
    labelWidth="120px"
    disabled="1"
    disabledMessage="This explains why the control is disabled. The message also has <b>support</b> for <a href='https://www.w3.org/html/'>HTML formatting</a>."
/>
