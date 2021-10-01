<script>
    import SelectControl from '../SelectControl.svelte';
    import SelectInput from '../SelectInput.svelte';

    export let options;

    const optgroups = [
        {
            label: 'shapes',
            options: [
                { value: 'circle', label: 'circle' },
                { value: 'square', label: 'square' }
            ]
        },
        {
            label: 'materials',
            options: [
                { value: 'paper', label: 'paper' },
                { value: 'metal', label: 'metal' }
            ]
        }
    ];

    let value = 'red';
    let changeValue = null;

    $: helpOptions = options.map(o => ({ ...o, help: `help balloon for <b>${o.label}</b>` }));

    $: tooltipOptions = options.map(o => ({ ...o, tooltip: `help text for ${o.label}` }));
</script>

<h3>Inline selects</h3>

<p>Use automatic label and control width unless specified</p>

<SelectControl {options} {optgroups} label="inline select" bind:value />

<SelectControl {options} {optgroups} label="inline select, longer label" bind:value />

<SelectControl {options} {optgroups} label="disabled" disabled={true} bind:value />

<SelectControl
    {options}
    {optgroups}
    label="on:change events"
    bind:value
    on:change={evt => (changeValue = evt.detail.target.value)}
/>

{#if changeValue !== null}
    <code>
        <b>Event triggered:</b>
        {changeValue}
    </code>
{/if}

<SelectControl
    {options}
    {optgroups}
    label="inline select, help text"
    miniHelp="This is some help text on an inline control"
    bind:value
/>

<SelectControl
    {options}
    {optgroups}
    label="inline select, custom label width for multi-line label text"
    valign="top"
    bind:value
    labelWidth="140px"
/>

<SelectControl
    {options}
    {optgroups}
    label="custom label width, custom control width"
    bind:value
    width="130px"
    labelWidth="140px"
/>

<SelectControl
    {options}
    label="disabled select, help text custom label width"
    miniHelp="You can't click this because I say so"
    disabled={true}
    bind:value
    labelWidth="140px"
/>

<hr />

<h3>Non-inline selects</h3>

<p>
    Use default label and control width to be consistent with other select-style controls such as
    SelectAxisColumnControl
</p>

<SelectControl {options} {optgroups} inline={false} label="non-inline select" bind:value />

<SelectControl
    {options}
    {optgroups}
    inline={false}
    label="non-inline select, custom control width"
    width="150px"
    valign="top"
    bind:value
/>

<SelectControl
    {options}
    {optgroups}
    inline={false}
    label="non-inline select, custom label width"
    labelWidth="150px"
    bind:value
/>

<SelectControl
    {options}
    inline={false}
    label="non-inline select with help text"
    miniHelp="This is some help text on a non-inline select control"
    bind:value
/>

<SelectControl
    {options}
    inline={false}
    label="with help text & help display"
    miniHelp="This is some help text on a non-inline select control"
    help="This is even more help text on a non-inline select control. And it can contain<b>HTML</b>! (really)"
    bind:value
/>

<SelectControl
    {options}
    {optgroups}
    inline={false}
    label="disabled with help text"
    miniHelp="You can't click this because I say so"
    disabled={true}
    bind:value
/>
<hr />
<p class="mini-help">SelectInput:</p>
<SelectInput {options} {optgroups} label="disabled select" bind:value labelWidth="100px" />
