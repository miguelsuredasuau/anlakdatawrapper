# EditorNav

Main navigation steps in the chart editor which appear as big arrow-tabs.


```html
<EditorNav bind:active="step" bind:maxStep bind:steps />

<script>
    import { EditorNav } from '@datawrapper/controls';
    // or import directly via
    // import EditorNav from '@datawrapper/controls/editor/EditorNav.html';
    
    export default {
        components: { EditorNav },
        data() {
            return {
                steps: [
                    { id: 'markers', title: 'Markers' },
                    { id: 'design', title: 'Design' },
                    { id: 'annotate', title: 'Annotate' },
                    { id: 'publish', title: 'Publish' }
                ],
                step: 'markers',
                maxStep: 3
            };
        },
    };
</script>
```
