# MoreOptionsGroup

Useful if you have **additional** options that you want to collapse by default.

## Attributes

-   `showLabel`: the label to show the additional options. Only change this if really necessary. Default: _Show advanced options_.
-   `hideLabel`: the label shown when options are shown. Change this accordingly to `showLabel`. Default: _Hide advanced options_.
-   `bottomLine`: display a horizontal line below the options when they are shown. This is useful if after this control similar options follow. Default: _false_.
-   `class`: to pass additional class names to the component, e.g. `mt-2` for some spacing.

```html
<MoreOptionsGroup showLabel="Show advanced options" hideLabel="Hide advanced options" bottomLine="{true|false}" disabled="{true|false}">
    <!-- more controls here -->
</MoreOptionsGroup>

<script>
    import { MoreOptionsGroup } from '@datawrapper/controls/MoreOptionsGroup.html';

    export default {
        components: { MoreOptionsGroup }
    };
</script>
```
