<script>
    import FeatureIntroductionDisplay from '_partials/displays/FeatureIntroductionDisplay.svelte';
    import SwitchControl from '_partials/controls/SwitchControl.svelte';
    import purifyHtml from '@datawrapper/shared/purifyHtml.js';
    import get from '@datawrapper/shared/get.js';
    import { getContext } from 'svelte';

    const { chart, theme } = getContext('page/edit');

    export let __;

    $: themeAutoDark = get($theme.data, 'options.darkMode.auto', 'user');
    $: disabledMessage =
        themeAutoDark !== 'user'
            ? __(`layout / auto-dark / disabled / always-${themeAutoDark ? 'on' : 'off'}`)
            : null;
    $: disabledState = themeAutoDark ? 'on' : 'off';
</script>

<FeatureIntroductionDisplay
    userDataKey="dark-mode-introduction"
    title={__('layout / auto-dark / intro / title')}
>
    <div slot="introduction" class="columns is-variable is-6 mb-0">
        <div class="column is-1">
            <svg width="30" height="30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M9.984.986A1 1 0 0 0 9 2v1a1 1 0 1 0 2 0V2A1.001 1.001 0 0 0 9.984.986zM4.332 3.332a1 1 0 0 0-.695 1.719l.707.707a1 1 0 1 0 1.414-1.414l-.707-.707a1 1 0 0 0-.719-.305zm11.305.002a1 1 0 0 0-.688.303l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0-.726-1.717zm9.343.656a1 1 0 0 0-.687.303l-20 20a1 1 0 1 0 1.414 1.414l20-20a1 1 0 0 0-.727-1.717zM10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 9a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2H2zm22 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM5.031 13.94a1 1 0 0 0-.687.302l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0-.727-1.716zM26 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-5.83.17A5.497 5.497 0 0 0 21.5 27a5.497 5.497 0 0 0 5.33-4.17c-.427.106-.87.17-1.33.17a5.5 5.5 0 0 1-5.5-5.5c0-.46.064-.903.17-1.33z"
                />
            </svg>
        </div>
        <div class="column">
            <p class="mb-2">{@html purifyHtml(__('layout / auto-dark / intro / body'))}</p>
            <img
                class="ml-2 is-pulled-right"
                src="/static/img/darkmodepreviewbtns.png"
                alt="dark mode preview buttons"
                style="width: 50px;"
            />
            <p>
                {@html purifyHtml(__('layout / auto-dark / intro / preview'))}
            </p>
        </div>
    </div>
    <svelte:fragment slot="controls">
        <SwitchControl
            bind:value={$chart.metadata.publish.autoDarkMode}
            disabled={themeAutoDark !== 'user'}
            {disabledMessage}
            {disabledState}
            label={__('layout / auto-dark / label')}
            tooltip={__('layout / auto-dark / help')}
        />
        <SwitchControl
            bind:value={$chart.metadata.visualize['dark-mode-invert']}
            label={__('layout / dark-mode-invert / label')}
            tooltip={__('layout / dark-mode-invert / help')}
            inverted={true}
        />
    </svelte:fragment>
</FeatureIntroductionDisplay>
