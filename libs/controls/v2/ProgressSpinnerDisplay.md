# ProgressSpinnerDisplay

Render a simple animated progress indicator.

## Attributes

-   `size`: the size of the spinner icon. Sets both width and height of the icon while keeping the correct aspect ratio.
-   `color`: the color of the spinner icon.
-   `class`: for passing additional class names to the component, e.g. `mt-2` for some spacing.
-   `valign`: vertical alignment with text. Uses the [`vertical-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align) CSS property.
-   `assetURL`: the path to the SVG sprite file that holds the icons. You don't have to set `assetURL` if you are using the icons on the [app.datawrapper.de](https://app.datawrapper.de) domain, as they will default to the correct path.

```html
Default spinner:
<ProgressSpinnerDisplay />

Custom size and color:
<ProgressSpinnerDisplay size="20px" color="#ff0000" />

<script>
    import { ProgressSpinnerDisplay } from '@datawrapper/controls/ProgressSpinnerDisplay.html';

    export default {
        components: { ProgressSpinnerDisplay }
    };
</script>
```
