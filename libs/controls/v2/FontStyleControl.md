# FontStyleControl

For styling text. Can be configured for many use cases:

## Attributes

-   `label`: the label shown left of the dropdown
-   `labelWidth`: the width of the label
-   `valign`: vertical alignment of the label – typically `middle`(default), `top`, or `bottom`
-   `fontSize`: whether to show the font size button or not
-   `spacing`: whether to show the letter spacing button or not
-   `color`: whether to show the color button or not
-   `colorReset`: lets you override the text for the color picker's reset button
-   `defaultColor`: the default color value
-   `background`: whether to show the background color button or not
-   `defaultBackground`: the default background color value
-   `backgroundReset`: lets you override the text for the background color picker's reset button
-   `help`: optional help text, to be displayed using `HelpDisplay`

```html
<FontStyleControl
    bind:value="style"
    label="Format"
    labelWidth="50px"
    valign="{middle|top|bottom}"
    fontSize="{true|false}"
    spacing="{true|false}"
    color="{true|false}"
    defaultColor="black"
    colorReset="Default"
    background="{true|false}"
    defaultBackground="white"
    backgroundReset="Transparent"
    help="This can hold a help text including some <b>HTML</b>"
/>
```
