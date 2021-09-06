# Dropdown

Like a [SelectControl], but allows for more customization of the control and custom HTML in dropdown items. If you don't want to customize the styling of the control or use custom HTML in the items, please use the [SelectControl] instead. For more selecting between three or less options, consider using a [SwitchControl] or [RadioControl].

## Attributes

-   `label`: the label shown left of the dropdown
-   `options`: the options selectable in the dropdown
-   `labelWidth`: width of the label
-   `valign`: vertical alignment of the label – typically `middle`(default), `top`, or `bottom`
-   `forcePlaceholder`: if true, the dropdown will never show the current value but always the placeholder
-   `passEvent`: if true, the `change` event handler will receive an object with `{event, value}` instead of just the value

```html
<DropdownControl
    bind:value="lblStyle"
    label="Label style"
    labelWidth="100px"
    valign="{middle|top|bottom}"
    disabled="{true|false}"
    itemRenderer="{MyRenderer}"
    forcePlaceholder="{true|false}"
    passEvent="{true|false}"
    options="{labelStyles}"
    help="This can hold a help text including some <b>HTML</b>"
/>

<script>
    import { DropdownControl } from '@datawrapper/controls';
    import MyRenderer from './MyDropdownItemRenderer.html';
    // or import directly via
    // import DropdownControl from '@datawrapper/controls/DropdownControl.html';

    export default {
        components: { DropdownControl },
        helpers: { MyRenderer },
        data() {
            return {
                lblStyle: 'tl',
                labelStyles: [
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
