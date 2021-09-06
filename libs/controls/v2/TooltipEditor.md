# TooltipEditor

A component for editing the template for "custom tooltips" in Datawrapper visualizations.

```html
<TooltipEditor
    label="Show tooltips"
    columns="{columns}"
    bind:value="tooltip" />

<script>
    import { TooltipEditor } from '@datawrapper/controls';
    // or import directly via
    // import TooltipEditor from '@datawrapper/controls/TooltipEditor.html';

    export default {
        components: { TooltipEditor },
        computed: {
            columns({ $dataset }) {
                return $dataset.columns()
            }
        },
        data() {
            return {
                tooltip: {
                    enabled: false,
                    title: '',
                    body: ''
                }
            }
        }
    }
</script>
```
