# TextAreaInput

A simple textarea.

```html
<TextAreaInput
    id="unique-identifier"
    bind:value="name"
    placeholder="e.g. William Playfair"
    valign="{top|middle|bottom}"
    autocomplete="{on|off}"
    disabled="{true|false}"
    expandable
    rows="3"
    resize="{both|horizontal|vertical|none}"
/>

<script>
    import { TextAreaInput } from '@datawrapper/controls';
    // or import directly via
    // import TextAreaInput from '@datawrapper/controls/TextAreaInput.html';

    export default {
        components: { TextAreaInput },
        data() {
            return {
                name: ''
            };
        }
    };
</script>
```
