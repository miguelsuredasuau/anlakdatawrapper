# OverlaysEditor

Renders a UI which provides the ability to add, edit and delete overlays to d3-bars. .

To use it, import this component into the controls app of a visualization plugin.

## Attributes

-   `ZERO_BASELINE`: defines the zero baseline
-   `axisColumn`: ID of column used for chart's main axis (e.g. 'bars' or 'columns')

```html
<OverlaysEditor ZERO_BASELINE="{String}" />

<script>
    import OverlaysEditor from '@datawrapper/controls/OverlaysEditor.html';

    export default {
        components: { OverlaysEditor }
    };
</script>
```
