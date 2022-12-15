import VisualizationIframe from './lib/VisualizationIframe.svelte';
import createEmotion from '@emotion/css/create-instance';

function render() {
    const target = document.getElementById('__svelte-dw');
    const { chart } = window.__DW_SVELTE_PROPS__;
    const emotion = createEmotion({
        key: `datawrapper-${chart.id}`,
        container: document.head
    });
    /* eslint-disable no-new */
    new VisualizationIframe({
        target,
        props: {
            ...window.__DW_SVELTE_PROPS__,
            outerContainer: target,
            emotion
        },
        hydrate: true
    });
}

render();
