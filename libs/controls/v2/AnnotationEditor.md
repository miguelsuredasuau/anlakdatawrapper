# AnnotationEditor

Renders a list of text annotations and an optional list of range annotations. Provides ability to add, edit and delete them.

To use it, import this component into the controls app of a visualization plugin.

## Attributes

-   `rangeAnnotations`: render a list of range annotations. Default: _false_.

```html
<AnnotationEditor rangeAnnotations="{true|false}" />

<script>
    import AnnotationEditor from '@datawrapper/controls/AnnotationEditor.html';

    export default {
        components: { AnnotationEditor }
    };
</script>
```
