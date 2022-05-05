<script type="text/javascript">
    import { readable } from 'svelte/store';
    import MainLayout from '_layout/MainLayout.svelte';
    import Menu from '_partials/Menu.svelte';

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
    import SignUpSection from './SignUpSection.svelte';
    import DropdownSection from './DropdownSection.svelte';
    import Svelte2Section from './Svelte2Section.svelte';
    import ErrorsSection from './ErrorsSection.svelte';
    import SearchInputSection from './SearchInputSection.svelte';
    import TagsInputSection from './TagsInputSection.svelte';
    import BulmaComponentsSection from './BulmaComponentsSection.svelte';
    import TypeaheadInputSection from './TypeaheadInputSection.svelte';
    import FileInputSection from './FileInputSection.svelte';
    import SaveButtonSection from './SaveButtonSection.svelte';
    import SwitchControlSection from './SwitchControlSection.svelte';
    import ChartPreviewIframeSection from './ChartPreviewIframeSection.svelte';

    export let magicNumber;
    export let chart;
    export let theme;
    export let __;

    const chartStore = readable(chart);

    export let icons;
    let contentRef;

    const menuGroups = [
        {
            title: 'Introduction',
            hideTitle: true,
            pages: [
                {
                    url: '#welcome',
                    title: 'Welcome',
                    view: WelcomeSection,
                    props: { magicNumber, __ }
                },
                { url: '#icons', title: 'Icons', view: IconsSection, props: { icons, __ } }
            ]
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
            title: 'Displays',
            pages: [
                { url: '#message', title: 'Message', view: MessageSection },
                { url: '#modal', title: 'Modal', view: ModalSection },
                { url: '#save', title: 'Save button', view: SaveButtonSection },
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
                {
                    url: '#setpassword',
                    title: 'Set Password',
                    view: SetPasswordSection,
                    props: { __ }
                },
                { url: '#search', title: 'Search Input', view: SearchInputSection },
                { url: '#tagsinput', title: 'Tags Input', view: TagsInputSection },
                { url: '#typeahead', title: 'Typeahead Input', view: TypeaheadInputSection },
                { url: '#file', title: 'File Input', view: FileInputSection, props: { __ } },
                { url: '#codemirror', title: 'CodeMirror Input', view: CodeMirrorInputSection },
                { url: '#switch', title: 'Switch Input', view: SwitchControlSection }
            ]
        },
        {
            title: 'Content',
            pages: [
                { url: '#form-field', title: 'Form Field', view: FormFieldSection, props: { __ } },
                {
                    url: '#markdown-input',
                    title: 'Markdown Input',
                    view: MarkdownInputSection,
                    props: { __ }
                },
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
</script>

<style type="text/css">
    /* :global(html) {
        background: var(--color-dw-white-bis);
    } */
</style>

<MainLayout title="Hello world">
    <section class="section">
        <div class="container">
            <div class="columns">
                <div class="column is-one-fifth">
                    <Menu content={contentRef} sticky groups={menuGroups} />
                </div>
                <div class="column is-four-fifths" bind:this={contentRef}>
                    {#each menuGroups as group}
                        {#if !group.hideTitle}
                            <h2 class="title is-2 mt-4 has-text-grey">{group.title}</h2>
                            <hr />
                        {/if}
                        {#each group.pages as page}
                            <svelte:component this={page.view} {...page.props || {}} />
                        {/each}
                    {/each}
                </div>
            </div>
        </div>
    </section>
</MainLayout>
