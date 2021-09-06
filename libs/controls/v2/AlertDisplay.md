# AlertDisplay

AlertDisplay is useful for showing the user some extra messages. There are currently 4 types: default, success, warning and error.
Per default AlertDisplay is not visible, has a close button and has no margin (exept margin-bottom:20px from bootstrap CSS).
AlertDisplay uses the Bootstart AlertDisplay CSS except for 'warning' where the color is slightly changed.
For **class** use the classes from the (spacing-helper documentation)[https://github.com/datawrapper/datawrapper/blob/master/assets/styles/datawrapper/common/spacing-helper.less].

```html
<AlertDisplay type="'success'|'warning'|'error'" closeable="{true|false}" visible="{true|false}" class="spacing-helper" />

<script>
    import { AlertDisplay } from '@datawrapper/controls';
    // or import directly via
    // import AlertDisplay from '@datawrapper/controls/AlertDisplay.html';

    export default {
        components: { AlertDisplay }
    };
</script>
```
