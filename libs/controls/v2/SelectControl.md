# Select

For more selecting between more than 3 options. For three or less options, consider using [SwitchControl] or [RadioControl]. If you want to customize the styling of the control or use custom HTML in the select items, please use the [Dropdown].

```html
<SelectControl
    label="Minimap position"
    help="This can hold a longer explanation including some <b>HTML</b>"
    miniHelp="Please select the placement of the minimap."
    bind:value="minimap.position"
    width="100px"
    valign="{middle|top|bottom}"
    labelWidth="100px"
    disabled="{true|false}"
    options="{options}"
    inline="{true|false}"
/>

<script>
    import { SelectControl } from '@datawrapper/controls';
    // or import directly via
    // import SelectControl from '@datawrapper/controls/SelectControl.html';

    export default {
        components: { SelectControl },
        data() {
            return {
                options: [
                    { value: 'tl', label: 'top left' },
                    { value: 'tr', label: 'top right' },
                    { value: 'bl', label: 'bottom left' },
                    { value: 'br', label: 'bottom right' }
                ]
            };
        }
    };
</script>
```
