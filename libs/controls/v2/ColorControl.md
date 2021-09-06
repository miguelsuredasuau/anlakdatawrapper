# ColorControl

The full color customization control. If you don't need a label and the "customize colors" button, you can also just use the [ColorPickerInput].

```html
<ColorControl
    label="Colorpicker"
    labelWidth="90px"
    help="This can hold a help text including some <b>HTML</b>"
    bind:value="colorOrFalse"
    bind:custom="customColors"
    customizable="{true|false}"
    compact="{true|false}"
    keys="{['foo', 'bar']}"
/>

<script>
    import ColorControl from '../ColorControl.html';

    // needs a theme palette
    import { Store } from 'svelte/store.js';
    const store = new Store({
        themeData: {
            colors: {
                palette: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99']
            }
        }
    });

    export default {
        components: { ColorControl },
        data() {
            return {
                value: '#a6cee3',
                customColors: {
                    foo: '#ff0000'
                }
            };
        },
        store: () => store
    };
</script>
```
