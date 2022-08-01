import VisualizationWebComponent from './lib/VisualizationWebComponent.wc.svelte';

if (!window.datawrapper) {
    window.datawrapper = {
        dependencyStates: {},
        dependencyCallbacks: [],
        onDependencyCompleted: function (cb) {
            window.datawrapper.dependencyCallbacks.push(cb);
        },
        dependencyCompleted: function () {
            for (const cb of window.datawrapper.dependencyCallbacks) {
                cb();
            }
        },
        render: async function (data) {
            // get the source script element
            // eslint-disable-next-line
            data.script = document.currentScript;
            data.origin = data.script.getAttribute('src').split('/').slice(0, -1).join('/');

            // create target element
            const elementId = `datawrapper-vis-${data.chart.id}`;
            const target = document.createElement('div');
            target.setAttribute('id', elementId);
            data.script.parentNode.insertBefore(target, data.script);

            const props = {
                target,
                props: {
                    outerContainer: target,
                    dependencyStates: window.datawrapper.dependencyStates,
                    ...data
                },
                hydrate: false
            };

            if (!customElements.get('datawrapper-visualization')) {
                customElements.define('datawrapper-visualization', VisualizationWebComponent);
                new VisualizationWebComponent(props);
            } else {
                const WebComponent = customElements.get('datawrapper-visualization');
                new WebComponent(props);
            }
        }
    };
}
