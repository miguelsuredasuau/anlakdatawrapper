# ColorPickerInput

Our signature color picker! This is just the colorpicker itself, without the label and the "Customize colors" button. If you want all of these, you need to use [ColorControl].

If the optional parameter `returnPaletteIndex` is set to `true`, the component will set the value to the palette index of the selected color, if available.

```html
<ColorPickerInput bind:color="value" returnPaletteIndex="{true|false}" />

<script>
    import ColorPickerInput from '../ColorPickerInput.html';

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
        components: { ColorPickerInput },
        data() {
            return { value: '#a6cee3' };
        },
        store: () => store
    };
</script>
```

#Themable ColorPickerInput properties:

The rendering of the color picker can be configured by properties that are defined in the theme.

All of the following properties are defined under `theme.colors`. They are all <i>optional</i>.

-   `groups`: Defines color groups that can optionally have a title
-   `picker.perRow`: Define how many swatches should fit per row (this adjusts the size of the swatches accordingly (default is 6))
-   `picker.showDuplicates`: If true, swatches for duplicate hex values are shown in the picker (default is false)
-   `picker.controls.hexEditable`: If false, hex input is readonly (default false)
-   `picker.controls.hue`: If false, hue slider not rendered in picker (default true)
-   `picker.controls.saturation`: If false, saturation slider not rendered in picker (default true)
-   `picker.controls.lightness`: If false, lightness slider not rendered in picker (default true)

# ColorPickerInput with configuration for picker in theme:

```html
<ColorPickerInput bind:color="value" />

<script>
    import ColorPickerInput from '../ColorPickerInput.html';

    // needs a theme palette
    import { Store } from 'svelte/store.js';
    const store = new Store({
        themeData: {
            colors: {
                picker: {
                    rowCount: 7,
                    showDuplicates: true,
                    controls: {
                        hexEditable: false,
                        hue: false,
                        saturation: false,
                        lightness: false
                    }
                },
                palette: [
                    '#2e75b8',
                    '#e68a17',
                    '#5c8c42',
                    '#a65583',
                    '#bd3823',
                    '#3b8991',
                    '#b5a06d',
                    '#7ab2e5',
                    '#ffc259',
                    '#9bd47f',
                    '#de9ebc',
                    '#ff9382',
                    '#80c7cf',
                    '#d9caa7'
                ]
            }
        }
    });

    export default {
        components: { ColorPickerInput },
        data() {
            return { value: '#a6cee3' };
        },
        store: () => store
    };
</script>
```

# ColorPickerInput - with groups defined in theme

```html
<ColorPickerInput bind:color="value" />

<script>
    import ColorPickerInput from '../ColorPickerInput.html';

    // needs a theme palette
    import { Store } from 'svelte/store.js';
    const store = new Store({
        themeData: {
            colors: {
                palette: [
                    '#82c6df',
                    '#ec8431',
                    '#ab7fb4',
                    '#c89d29',
                    '#adc839',
                    '#5788b8',
                    '#a6c8e1',
                    '#d84e55',
                    '#edabaf',
                    '#eddb80',
                    '#e2e3e4',
                    '#d2c9a6',
                    '#e6ad57',
                    '#e6d67c',
                    '#b9b1cc',
                    '#a3dbd0',
                    '#8fa0aa'
                ],
                groups: [
                    {
                        name: 'Standard Colors',
                        colors: [['#82c6df', '#ec8431', '#ab7fb4', '#c89d29', '#adc839']]
                    },
                    {
                        name: 'Election colors',
                        colors: [['#5788b8', '#a6c8e1', '#d84e55', '#edabaf'], ['#eddb80', '#e2e3e4', '#d2c9a6']]
                    },
                    {
                        name: 'Categories',
                        colors: [['#e6ad57', '#e6d67c', '#b9b1cc', '#a3dbd0', '#8fa0aa']]
                    }
                ]
            }
        }
    });

    export default {
        components: { ColorPickerInput },
        data() {
            return { value: '#82c6df' };
        },
        store: () => store
    };
</script>
```
