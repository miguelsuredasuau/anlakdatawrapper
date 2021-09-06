# PublishButtonControl

Renders the publishing status, button, and error messages in step 4 (Publish & Embed)

## Attributes

-   `published`: the chart has already been published
-   `publishing`: the chart is currently publishing
-   `needsRepublish`: the chart has changes that haven't been published yet
-   `publishStarted`: timestamp of when the current publishing process started
-   `now`: timestamp of the latest publishing progress state change
-   `progress`: array of string identifiers that represent states in the publishing process
-   `on:publish`: handler for publishing a chart
-   `on:unpublish`: handler for unpublishing a chart
-   `assetURL`: the path to the SVG sprite file that holds the icons. You don't have to set `assetURL` if you are using the icons on the [app.datawrapper.de](https://app.datawrapper.de) domain, as they will default to the correct path.

```html
<PublishButton
    published="{true|false}"
    publishing="{true|false}"
    needsRepublish="{true|false}"
    on:publish="console.log('Trigger publishing!')"
    on:unpublish="console.log('Trigger unpublishing!')"
    publishStarted="{Date.now()}"
    progress="{['preparing', 'rendering', 'uploading']}"
/>

<script>
    import { PublishButton } from '@datawrapper/controls/PublishButtonControl.html';

    export default {
        components: { PublishButton }
    };
</script>
```
