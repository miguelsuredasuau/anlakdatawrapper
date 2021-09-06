# TextControl

A simple text field with a label.

This control supports dynamic multi-line text via the `expandable` attribute. When `expandable` is set, the height of the control increases vertically as the user types text. The maximum number of lines can be set using the `rows` property.

For static multiline text, use [TextAreaControl].

```html
<TextControl
    id="unique-identifier"
    label="Your name:"
    labelWidth="120px"
    bind:value="name"
    help="This can hold a longer explanation including some <b>HTML</b>"
    miniHelp="This is where you enter your name"
    placeholder="e.g. William Playfair"
    valign="{top|middle|bottom}"
    autocomplete="{on|off}"
    disabled="{true|false}"
    disabledMessage="This is shown when the field is disabled"
    expandable
    rows="3"
/>

<script>
    import { TextControl } from '@datawrapper/controls';
    // or import directly via
    // import TextControl from '@datawrapper/controls/TextControl.html';

    export default {
        components: { TextControl },
        data() {
            return {
                name: ''
            };
        }
    };
</script>
```
