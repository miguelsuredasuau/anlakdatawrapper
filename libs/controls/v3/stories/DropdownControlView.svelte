<script>
    import DropdownControl from '../DropdownControl.svelte';
    import CheckboxControl from '../CheckboxControl.svelte';

    export let value = 'red';
    export let options = [];

    const htmlOptions = options.map(option => {
        return Object.assign({}, option, {
            label: `<span style="color:${option.value}"><i class="fa fa-picture-o"></i> ${option.label}</span>`
        });
    });

    const manyOptions = options.concat(
        [
            'crimson',
            'pink',
            'coral',
            'tomato',
            'gold',
            'yellow',
            'khaki',
            'violet',
            'fuchsia',
            'magenta',
            'purple',
            'indigo',
            'lime',
            'green',
            'olive',
            'teal',
            'cyan',
            'turquoise',
            'navy',
            'wheat',
            'tan',
            'brown',
            'black',
            'white',
            'grey',
            'silver'
        ].map(value => {
            return { value, label: value, id: value };
        })
    );
</script>

<DropdownControl bind:value {options} label="basic" />
<DropdownControl bind:value {options} label="longer label" />
<DropdownControl bind:value {options} label="fixed label width" labelWidth="120px" />
<DropdownControl bind:value {options} label="fixed label width, long text" labelWidth="120px" />
<DropdownControl bind:value {options} label="fixed input width" width="150px" />
<DropdownControl
    bind:value
    {options}
    label="fixed label width and fixed input width"
    labelWidth="120px"
    width="150px"
/>
<DropdownControl
    bind:value
    options={manyOptions}
    label="many options"
    labelWidth="120px"
    width="150px"
/>
<DropdownControl bind:value options={htmlOptions} label="html options" labelWidth="120px" />
<DropdownControl
    bind:value
    {options}
    label="force placeholder"
    labelWidth="120px"
    forcePlaceholder
/>
<DropdownControl
    bind:value
    {options}
    label="force placeholder, custom placeholder text"
    labelWidth="120px"
    forcePlaceholder
    placeholder="my custom text"
/>
<DropdownControl
    bind:value
    {options}
    label="force label"
    labelWidth="120px"
    forceLabel="whatever"
/>
<DropdownControl
    bind:value
    {options}
    label="long forced label with fixed input width"
    labelWidth="120px"
    width="150px"
    forceLabel="rather long label text"
/>
<DropdownControl bind:value {options} label="disabled" labelWidth="120px" disabled />
<DropdownControl bind:value {options} label="help" labelWidth="120px" help="Some help text" />
<DropdownControl
    bind:value
    {options}
    label="custom item renderer"
    labelWidth="120px"
    itemRenderer={CheckboxControl}
/>
