# TextAreaControl

For entering multiline text. For single-line text, use [TextControl].

```html
<TextAreaControl
    label="Your name:"
    bind:value="name"
    help="This can hold a longer explanation including some <b>HTML</b>"
    miniHelp="This is where you enter your name"
    placeholder="e.g. William Playfair"
    disabled="{true|false}"
    resize="{both|horizontal|vertical|none}"
/>

<script>
    import { TextAreaControl } from '@datawrapper/controls';
    // or import directly via
    // import TextAreaControl from '@datawrapper/controls/TextAreaControl.html';

    export default {
        components: { TextAreaControl },
        data() {
            return {
                value: 'Textarea content'
            };
        }
    };
</script>
```
