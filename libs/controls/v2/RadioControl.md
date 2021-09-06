# RadioControl

For more selecting between three or less options. For more options, consider using [SelectControl]. For stacked radio buttons set `inline` to false.

```html
<!-- prettier-ignore -->
<RadioControl
    bind:value="align"
    label="Text alignment"
    labelWidth="100px"
    help="This can hold a help text including some <b>HTML</b>"
    disabled="{true|false}"
    inline="{true|false}"
    options="{options}" />

<script>
    import { RadioControl } from '@datawrapper/controls';
    // or import directly via
    // import RadioControl from '@datawrapper/controls/RadioControl.html';

    export default {
        components: { RadioControl },
        data() {
            return {
                options: [{ value: 'left', label: 'left' }, { value: 'right', label: 'right' }]
            };
        }
    };
</script>
```
