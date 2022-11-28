<script>
    import Context from '../../utils/svelte-view/Context.svelte';
    import View from './Index.svelte';
    import { ViewComponents } from '_utils/view-components.mjs';

    export let stores;

    const viewComponents = new ViewComponents();

    import Base from './Base.svelte';
    viewComponents.set('edit/base', Base);

    // chart workflow steps
    import Upload from './chart/Upload.svelte';
    viewComponents.set('edit/chart/upload', Upload);
    import Describe from './chart/Describe.svelte';
    viewComponents.set('edit/chart/describe', Describe);
    import Visualize from './chart/Visualize.svelte';
    viewComponents.set('edit/chart/visualize', Visualize);
    import Publish from './chart/Publish.svelte';
    viewComponents.set('edit/chart/publish', Publish);

    // core layout tab controls
    import DarkModeControl from './chart/visualize/layout/DarkModeControl.svelte';
    viewComponents.set('edit/chart/visualize/layout/darkMode', DarkModeControl);
    import EmbedControl from './chart/visualize/layout/EmbedControl.svelte';
    viewComponents.set('edit/chart/visualize/layout/embed', EmbedControl);
    import GetTheDataControl from './chart/visualize/layout/GetTheDataControl.svelte';
    viewComponents.set('edit/chart/visualize/layout/data', GetTheDataControl);
    import LogoControl from './chart/visualize/layout/LogoControl.svelte';
    viewComponents.set('edit/chart/visualize/layout/logo', LogoControl);
    import ThemeControl from './chart/visualize/layout/ThemeControl.svelte';
    viewComponents.set('edit/chart/visualize/layout/theme', ThemeControl);
    import LocaleControl from './chart/visualize/layout/LocaleControl.svelte';
    viewComponents.set('edit/chart/visualize/layout/locale', LocaleControl);

    // ROLLUP IMPORT VIEW COMPONENTS edit/Index.svelte
</script>

<Context view={View} {stores} {viewComponents} {...$$restProps} />
