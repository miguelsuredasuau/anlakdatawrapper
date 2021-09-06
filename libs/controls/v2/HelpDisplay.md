# HelpDisplay

This components adds a little `?` icon next to the control. On mouseover, a help balloon appears, which can contain any HTML, including links.

```html
<HelpDisplay> Help texts can include <b>HTML</b> and should be defined right before the UI control </HelpDisplay>
<TextControl value="foo" bind:value label="Input with help" />

<script>
    import HelpDisplay from '../HelpDisplay.html';
    import TextControl from '../TextControl.html';

    export default {
        components: { HelpDisplay, TextControl }
    };
</script>
```
