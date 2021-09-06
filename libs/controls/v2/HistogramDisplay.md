# HistogramDisplay

HistogramDisplays can be a useful UI element when dealing with large amounts of data. They give a quick overview of the value distribution and can be used to identify outliers or to communicate color scales.

```html
<HistogramDisplay values="{[1,2,3,4,...]}" color="{v => v < 0 ? 'red' : 'black'}" steps="{[{x:1, label:'1'}]}" />

<script>
    import HistogramDisplay from '../HistogramDisplay.html';

    export default {
        components: { HistogramDisplay }
    };
</script>
```
