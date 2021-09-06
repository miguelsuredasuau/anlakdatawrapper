# ChartPreview

Adds the chart preview

```html

<ChartPreview
    on:beforeResize="BeforeResize"
    resizable="WhenNotToResize e.g. a step"
    on:resize="WhenResizing"
/>


<script>
    import { ChartPreview } from '@datawrapper/controls';
    // or import directly via
    // import ChartPreview from '@datawrapper/controls/editor/ChartPreview.html';
    
    export default {
        components: { ChartPreview }
    };
</script>
```
