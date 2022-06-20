<script type="text/javascript">
    import { onMount } from 'svelte';
    import { readable } from 'svelte/store';
    import MainLayout from '_layout/MainLayout.svelte';
    import TreeMenu from './TreeMenu.svelte';

    import WelcomeSection from './WelcomeSection.svelte';
    import IconsSection from './IconsSection.svelte';
    import ButtonGroupSection from './ButtonGroupSection.svelte';
    import PaginationSection from './PaginationSection.svelte';
    import TabsSection from './TabsSection.svelte';
    import MenuSection from './MenuSection.svelte';
    import MessageSection from './MessageSection.svelte';
    import ModalSection from './ModalSection.svelte';

    import CheckboxSection from './CheckboxSection.svelte';
    import RadioInputSection from './RadioInputSection.svelte';
    import MarkdownInputSection from './MarkdownInputSection.svelte';
    import CodeMirrorInputSection from './CodeMirrorInputSection.svelte';
    import SetPasswordSection from './SetPasswordSection.svelte';
    import FormFieldSection from './FormFieldSection.svelte';
    import HorizontalFormFieldSection from './HorizontalFormFieldSection.svelte';
    import SignUpSection from './SignUpSection.svelte';
    import DropdownSection from './DropdownSection.svelte';
    import Svelte2Section from './Svelte2Section.svelte';
    import ErrorsSection from './ErrorsSection.svelte';
    import SearchInputSection from './SearchInputSection.svelte';
    import TextInputSection from './TextInputSection.svelte';
    import TagsInputSection from './TagsInputSection.svelte';
    import ToolbarSection from './ToolbarSection.svelte';
    import BulmaComponentsSection from './BulmaComponentsSection.svelte';
    import TypeaheadInputSection from './TypeaheadInputSection.svelte';
    import FileInputSection from './FileInputSection.svelte';
    import SaveButtonSection from './SaveButtonSection.svelte';
    import SwitchControlSection from './SwitchControlSection.svelte';
    import ChartPreviewIframeSection from './ChartPreviewIframeSection.svelte';
    import RadioInput from '_partials/controls/RadioInput.svelte';

    export let magicNumber;
    export let chart;
    export let theme;
    export let __;

    const chartStore = readable(chart);

    export let icons;
    let contentRef;

    let whiteBg = true;

    function loadPage(page) {
        activePage = page;
        window.scrollTo(0, 0);
        window.location.hash = page.url;
    }

    const menuGroups = [
        {
            title: 'Displays',
            pages: [
                {
                    url: '#welcome',
                    title: 'Welcome',
                    view: WelcomeSection,
                    props: { magicNumber, __ }
                },
                { url: '#icons', title: 'Icons', view: IconsSection, props: { icons, __ } },
                { url: '#message', title: 'Message', view: MessageSection },
                { url: '#modal', title: 'Modal', view: ModalSection },
                { url: '#save', title: 'Save button', view: SaveButtonSection },
                { url: '#form-field', title: 'FormField', view: FormFieldSection, props: { __ } },
                {
                    url: '#form-field-h',
                    title: 'FormField (horiz.)',
                    view: HorizontalFormFieldSection,
                    props: { __ }
                },
                {
                    url: '#preview',
                    title: 'ChartIframePreview',
                    view: ChartPreviewIframeSection,
                    props: { chart: chartStore, theme, __ }
                }
            ]
        },

        {
            title: 'Controls',
            pages: [
                { url: '#button-groups', title: 'Button groups', view: ButtonGroupSection },
                { url: '#checkbox', title: 'Checkbox', view: CheckboxSection },
                { url: '#radio', title: 'Radio Input', view: RadioInputSection },
                { url: '#switch', title: 'Switch Input', view: SwitchControlSection },
                { url: '#textinput', title: 'Text Input', view: TextInputSection },
                { url: '#tagsinput', title: 'Tags Input', view: TagsInputSection },
                { url: '#typeahead', title: 'Typeahead Input', view: TypeaheadInputSection },
                { url: '#search', title: 'Search Input', view: SearchInputSection },
                {
                    url: '#setpassword',
                    title: 'Set Password',
                    view: SetPasswordSection,
                    props: { __ }
                },
                {
                    url: '#markdown-input',
                    title: 'Markdown Input',
                    view: MarkdownInputSection,
                    props: { __ }
                },
                { url: '#file', title: 'File Input', view: FileInputSection, props: { __ } },
                { url: '#codemirror', title: 'CodeMirror Input', view: CodeMirrorInputSection }
            ]
        },
        {
            title: 'Editor',
            pages: [{ url: '#toolbar', title: 'Toolbar', view: ToolbarSection, props: { __ } }]
        },
        {
            title: 'Navigation',
            pages: [
                { url: '#pagination', title: 'Pagination', view: PaginationSection },
                { url: '#tabs', title: 'Tabs', view: TabsSection },
                { url: '#menu', title: 'Menu', view: MenuSection }
            ]
        },

        {
            title: 'Content',
            pages: [
                { url: '#signup', title: 'Sign Up', view: SignUpSection, props: { __ } },
                { url: '#bulma', title: 'Bulma', view: BulmaComponentsSection }
            ]
        },
        {
            title: 'Misc.',
            pages: [
                { url: '#dropdown', title: 'Dropdown', view: DropdownSection },
                { url: '#svelte2', title: 'Svelte2', view: Svelte2Section },
                { url: '#errors', title: 'Errors', view: ErrorsSection }
            ]
        }
    ];

    let activePage = menuGroups[0].pages[0];
    onMount(() => {
        if (window.location.hash) {
            for (const group of menuGroups) {
                const match = group.pages.find(p => p.url === window.location.hash);
                if (match) {
                    activePage = match;
                    break;
                }
            }
        }
    });
</script>

<style type="text/css">
    /* :global(html) {
        background: var(--color-dw-white-bis);
    } */
</style>

<MainLayout title="Hello world">
    <section class="section" class:has-background-white-bis={!whiteBg}>
        <div class="container">
            <div class="is-pulled-right has-text-grey">
                <RadioInput
                    options={[
                        { value: true, label: 'white bg' },
                        { value: false, label: 'gray bg' }
                    ]}
                    bind:value={whiteBg}
                />
            </div>
            <h1 class="title is-2">Hello world!</h1>

            <div class="columns is-clearfix">
                <div class="column is-one-fifth">
                    <TreeMenu {loadPage} content={contentRef} groups={menuGroups} />
                </div>
                <div class="column is-four-fifths" bind:this={contentRef}>
                    <svelte:component this={activePage.view} {...activePage.props || {}} />
                </div>
            </div>
        </div>
    </section>
</MainLayout>
