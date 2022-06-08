# FeatureIntroductionDisplay

The FeatureIntroductionDisplay is useful for when a new feature is introduced, and the corresponding control(s)
should be wrapped in a notification. Closing the introduction leaves just the controls content behind.

You need to specify a user data key, which will be used to persist the 'seen' state of the introduction.

```html
<FeatureIntroductionDisplay key="3d-pies-introduction" title="New: 3D pie charts">
    <!-- The 'content' slot contains the text content of the introduction -->
    <div slot="content">
        The 'content' slot contains the text content of the introduction
    </div>
    <div slot="controls">
        The 'controls' slot contains the embedded controls.
        This will remain visible after the introduction wrapper has been closed
        <SwitchControl label="3D mode" help="This will make your pie chart look really cool">
            <NumberControl label="3D depth" value=5 />
        </SwitchControl>
    </div>
</FeatureIntroductionDisplay>

<script>
    import { FeatureIntroductionDisplay, SwitchControl, NumberControl } from '@datawrapper/controls';
    // or import directly via
    // import FeatureIntroductionDisplay from '@datawrapper/controls/FeatureIntroductionDisplay.html';

    export default {
        components: { FeatureIntroductionDisplay, SwitchControl, NumberControl }
    };
</script>
```
