# GradientDisplay

Renders an SVG rectangle filled with an horizontal gradient

```html
<GradientDisplay width="300" height="10" stops="{myStops}" />

<script>
    import { GradientDisplay } from '@datawrapper/controls';
    // or import directly via
    // import GradientDisplay from '@datawrapper/controls/GradientDisplay.html';

    export default {
        components: { GradientDisplay },
        helpers: {
            myStops: [{ color: '#ffff00', offset: 0 }, { color: '#cc0055', offset: 0.5 }, { color: '#440000', offset: 1 }]
        }
    };
</script>
```
