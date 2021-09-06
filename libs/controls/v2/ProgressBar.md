# Progress Bar 

Show loading, redirecting or action status.
Uses Bootstrap 2 and custom CSS with Datawarpper colors.

**Attributes:**

* `status`: the progress in % ranging from 0 to 100
* `height`: height of the bar in px
* `visible`: whether the bar is visible

```html
<ProgressBar 
    status="50" // status in %
    height="10" // height of progress bar
    visible="{true|false}"
    />

<script>
    import { ProgressBar } from '@datawrapper/controls';

    // or import directly via
    // import ProgressBar from '@datawrapper/controls/ProgressBar.html';

    export default {
        components: { ProgressBar }
    }
</script>
```