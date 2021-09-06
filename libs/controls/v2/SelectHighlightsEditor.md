# SelectHighlights

This component is used to highlight individual elements in several chart types, such as bar charts, column charts, and pie charts. It is usually placed in the 'annotate' tab and expects an array of column labels as a value. The value is commonly stored in `$metadata.visualize['highlighted-series']`.

```html
<SelectHighlightsEditor bind:value="highlights" />

<script>
    import { SelectHighlightsEditor } from '@datawrapper/controls';

    export default {
        components: {
            SelectHighlightsEditor
        },
        data() {
            return {
                highlights: ['foo', 'bar', 'baz']
            };
        }
    };
</script>
```
