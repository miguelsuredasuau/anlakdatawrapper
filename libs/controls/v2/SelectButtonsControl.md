# SelectButtons

Very similar to a [RadioControl] control, but it uses Buttons instead of `<input type="radio">` elements. Useful if you want to allow selecting between different icons.

```html
<SelectButtonsControl
    bind:value
    options="{options}"
    label="select"
    labelWidth="120px"
    help="This can hold a longer explanation including some <b>HTML</b>"
/>

<script>
    import SelectButtonsControl from '@datawrapper/controls/SelectButtonsControl.html';
    // import { SelectButtonsControl } from '@datawrapper/controls';

    export default {
        components: { SelectButtonsControl },
        data() {
            return {
                options: [
                    {
                        // option labels can be simple text
                        value: 'text',
                        label: 'simple text'
                    },
                    {
                        // or arbitrary HTML code
                        value: 'icon',
                        label: '<i class="fa fa-fw fa-bug'
                    },
                    {
                        // or an SVG path (should fit 24px height)
                        value: 'svg',
                        svg:
                            'M11 24h-6v-17h6v17zm-2-4l-2 1v1l2-1v-1zm2-18h10l3 3v1h-5v6h1v3.396c-1.66.085-2.782.652-3 1.604-.131.574.145 1.553 1.12 1.699.665.1 1.325-.24 1.657-.825.335-.661 1.201-.158.932.45-.429 1.023-1.526 1.676-2.709 1.676-1.656 0-3-1.344-3-3 0-1.305.835-2.417 2-2.829v-2.171h1v-6h-14v3h-4v-7h5v-2h6v2zm-2 15l-2 1v1l2-1v-1zm0-3l-2 1v1l2-1v-1zm0-3l-2 1v1l2-1v-1zm0-3l-2 1v1l2-1v-1z'
                    }
                ]
            };
        }
    };
</script>
```
