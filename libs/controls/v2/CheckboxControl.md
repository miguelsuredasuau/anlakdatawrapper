# CheckboxControl

Checkboxes are useful for simple yes/no settings. If the settings triggers the display of other settings you might want to use a [SwitchControl] instead.

```html
<CheckboxControl
    label="sort bars descending"
    bind:value="sortDescending"
    disabled="{true|false}"
    disabledMessage="you can't sort the bars because of XYZ"
    indeterminate="{true|false}"
    compact="{true|false}"
    help="Some help text"
    faded="{true|false}"
/>

<script>
    import { CheckboxControl } from '@datawrapper/controls';
    // or import directly via
    // import CheckboxControl from '@datawrapper/controls/CheckboxControl.html';

    export default {
        components: { CheckboxControl }
    };
</script>
```
