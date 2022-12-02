<script type="text/javascript">
    import DropdownInput from '_partials/controls/DropdownInput.svelte';
    import CustomDropdownItemRenderer from './CustomDropdownItemRenderer.svelte';

    const options = ['Alpha', 'Beta', 'Gamma', 'Delta'].map(s => ({ value: s, label: s }));

    let value = 'Alpha';

    const optionsStyle = [
        {
            value: '#c71e1d',
            label: '<b style="color:#c71e1d">firebrick</b>'
        },
        {
            value: '#4688D7',
            label: '<b style="color:#4688D7">blue</b>'
        },
        {
            value: '#FFB327',
            label: '<b style="color:#FFB327">orange</b>'
        },
        { divider: true },
        {
            value: '#cf4870',
            label: '<b style="color:#cf4870">red</b>'
        }
    ];
    let valueStyle = '#c71e1d';

    async function passiveDemoHandler(event) {
        passiveDemo = `You changed the value to <b style="color:${event.detail.value}">${event.detail.value}</b>!`;
        setTimeout(() => {
            passiveDemo = ''; // reset
        }, 3000);
    }
    let passiveDemo = '';
</script>

<div class="section pl-0 pt-0">
    <h3 id="dropdowninput" class="title is-3">DropdownInput</h3>
    <p class="subtitle is-5">
        This component acts like a simple HTML <tt>select</tt> input, but it allows the options/items
        to be rendered with custom HTML or a Svelte component. It should only be used if you really need
        custom styling for the options/items
    </p>
    <div class="block">
        <DropdownInput bind:value {options} /> <span class="has-text-grey ml-3">({value})</span>
    </div>
    <div class="block columns">
        <div class="column">
            <p class="mb-3">
                When the component is <b>block</b>, it will fill the entire container. You can also
                set the <b>width</b> to <tt>100%</tt>.
            </p>
            <DropdownInput bind:value={valueStyle} options={optionsStyle} block width="100%" />
        </div>
        <div class="column">
            <p class="mb-3">
                When the component is <b>passive</b>, you need to catch the <tt>change</tt> event and
                update the value manually.
            </p>
            <DropdownInput
                bind:value={valueStyle}
                options={optionsStyle}
                passive
                width="200px"
                on:change={passiveDemoHandler}
            />
            <p class="mt-2">{@html passiveDemo}</p>
        </div>
    </div>
    <div class="block columns">
        <div class="column is-half">
            <p class="mb-3">
                You can also use a custom <b>itemRenderer</b> component to avoid writing too much inline
                HTML/CSS or if you want to add interactivity within the dropdown items.
            </p>
            <DropdownInput
                bind:value={valueStyle}
                itemRenderer={CustomDropdownItemRenderer}
                options={optionsStyle}
            />
        </div>
        <div class="column">
            <p>
                To add in <b>dividing lines</b>, insert <code>{'{ divider: true }'}</code> objects into
                the options array.
            </p>
        </div>
    </div>
</div>
