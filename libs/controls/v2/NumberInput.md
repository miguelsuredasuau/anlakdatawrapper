# NumberInput

For raw numeric input via slider and/or stepper (without the controlgroup and the label). In most cases you probably want to use the [NumberControl] component instead.

```html
<NumberInput
    bind:value="padding"
    unit="px"
    min="0"
    max="100"
    step="5"
    disabled="{true|false}"
    multiply="1"
    allowUndefined="{true|false}"
    placeholder="text"
/>

<script>
    import { NumberInput } from '@datawrapper/controls';
    // or import directly via
    // import NumberInput from '@datawrapper/controls/NumberInput.html';

    export default {
        components: { NumberInput },
        data() {
            return {
                value: 42
            };
        }
    };
</script>
```
