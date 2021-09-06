# ProceedButtonNav

Adds Buttons to navigate through the main chart creation steps.


```html
<ProceedButtonNav bind:active="step" bind:steps />

<script>
    import { ProceedButtonNav } from '@datawrapper/controls';
    // or import directly via
    // import ProceedButtonNav from '@datawrapper/controls/editor/ProceedButtonNav.html';
    
    export default {
        components: { ProceedButtonNav },
        data() {
            return {
                steps: [
                    { id: 'markers', title: 'Markers' },
                    { id: 'design', title: 'Design' },
                    { id: 'annotate', title: 'Annotate' },
                    { id: 'publish', title: 'Publish' }
                ],
                step: 'markers',
            };
        },
    };
</script>
```
