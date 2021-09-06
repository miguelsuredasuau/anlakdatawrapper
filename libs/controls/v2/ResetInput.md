# ResetInput

The ResetInput component consists of an arrow that can be placed next to other controls to reset a default value. The arrow shows up when the value is not the default value and disapears again when its the dafault value. It is clickable.

```html
<ResetInput bind:value="value" defaultValue="some default/initial value" />

<script>
    import { ResetInput } from '@datawrapper/controls';
    // or import directly via
    // import ResetInput from '@datawrapper/controls/ResetInput.html';

    export default {
        components: { ResetInput }
    };
</script>
```
