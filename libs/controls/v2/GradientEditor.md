# GradientEditor

The GradientEditor is a component for selecting and editing gradients from a list of presets. The editing includes re-arrangement (=adding, moving, deleting) of color stops as well as a few gradient-level operations such as reverersing the colors, auto-correcting the lightness, as well as increasing and decreasing the gradient contrast.

```html
<GradientEditor
    label="Edit gradient"
    themePreset="{themePreset}"
    bind:colors />
<script>
    import GradientEditor from '@datawrapper/controls/GradientEditor.html';

    export default {
        components: { GradientEditor },
        data() {
            return {
                colors: []
            };
        },
    };
</script>
```