<script type="text/javascript">
    import { onMount } from 'svelte';
    import { readable } from 'svelte/store';
    import MainLayout from '_layout/MainLayout.svelte';
    import TreeMenu from './TreeMenu.svelte';
    import ComponentInfo from './ComponentInfo.svelte';

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

    export let componentInfos;

    const menuGroups = [
        {
            title: 'General',
            pages: [
                {
                    url: '#welcome',
                    title: 'Welcome',
                    view: WelcomeSection,
                    props: { magicNumber, __ }
                }
            ]
        },
        {
            title: 'Displays',
            pages: [
                {
                    url: '#icons',
                    title: 'Icons',
                    view: IconsSection,
                    props: { icons, __ },
                    components: ['_partials/displays/IconDisplay.svelte']
                },
                {
                    url: '#message',
                    title: 'Message',
                    view: MessageSection,
                    components: ['_partials/displays/MessageDisplay.svelte']
                },
                {
                    url: '#modal',
                    title: 'Modal',
                    view: ModalSection,
                    components: ['_partials/displays/ModalDisplay.svelte']
                },
                {
                    url: '#save',
                    title: 'Save button',
                    view: SaveButtonSection,
                    components: ['_partials/displays/SaveButtonDisplay.svelte']
                },
                {
                    url: '#form-field',
                    title: 'FormField',
                    view: FormFieldSection,
                    components: ['_partials/displays/FormFieldDisplay.svelte'],
                    props: { __ }
                },
                {
                    url: '#form-field-h',
                    title: 'FormField (horiz.)',
                    view: HorizontalFormFieldSection,
                    components: ['_partials/displays/HorizontalFormFieldDisplay.svelte'],
                    props: { __ }
                },
                {
                    url: '#preview',
                    title: 'ChartIframePreview',
                    view: ChartPreviewIframeSection,
                    components: ['_partials/displays/ChartPreviewIframeDisplay.svelte'],
                    props: { chart: chartStore, theme, __ }
                }
            ]
        },

        {
            title: 'Controls',
            pages: [
                {
                    url: '#button-groups',
                    title: 'Button groups',
                    view: ButtonGroupSection,
                    components: ['_partials/controls/ButtonGroupInput.svelte']
                },
                {
                    url: '#checkbox',
                    title: 'Checkbox',
                    view: CheckboxSection,
                    components: ['_partials/controls/CheckboxInput.svelte']
                },
                {
                    url: '#radio',
                    title: 'Radio Input',
                    view: RadioInputSection,
                    components: ['_partials/controls/RadioInput.svelte']
                },
                {
                    url: '#switch',
                    title: 'Switch Input',
                    view: SwitchControlSection,
                    components: ['_partials/controls/SwitchControl.svelte']
                },
                {
                    url: '#textinput',
                    title: 'Text Input',
                    view: TextInputSection,
                    components: [
                        '_partials/controls/TextInput.svelte',
                        '_partials/controls/TextAreaInput.svelte'
                    ]
                },
                {
                    url: '#tagsinput',
                    title: 'Tags Input',
                    view: TagsInputSection,
                    components: ['_partials/controls/TagsInput.svelte']
                },
                {
                    url: '#typeahead',
                    title: 'Typeahead Input',
                    view: TypeaheadInputSection,
                    components: ['_partials/controls/TypeaheadInput.svelte']
                },
                {
                    url: '#search',
                    title: 'Search Input',
                    view: SearchInputSection,
                    components: ['_partials/controls/SearchInput.svelte']
                },
                {
                    url: '#setpassword',
                    title: 'Set Password',
                    view: SetPasswordSection,
                    components: ['_partials/controls/SetPasswordInput.svelte'],
                    props: { __ }
                },
                {
                    url: '#markdown-input',
                    title: 'Markdown Input',
                    view: MarkdownInputSection,
                    components: ['_partials/controls/MarkdownInput.svelte'],
                    props: { __ }
                },
                {
                    url: '#file',
                    title: 'File Input',
                    view: FileInputSection,
                    props: { __ },
                    components: ['_partials/controls/MarkdownInput.svelte']
                },
                {
                    url: '#codemirror',
                    title: 'CodeMirror Input',
                    view: CodeMirrorInputSection,
                    components: ['_partials/controls/CodeMirrorInput.svelte']
                }
            ]
        },
        {
            title: 'Editor',
            pages: [
                {
                    url: '#toolbar',
                    title: 'Toolbar',
                    view: ToolbarSection,
                    props: { __ },
                    components: [
                        '_partials/editor/Toolbar.svelte',
                        '_partials/editor/ToolbarArea.svelte',
                        '_partials/editor/ToolbarItem.svelte'
                    ]
                }
            ]
        },
        {
            title: 'Navigation',
            pages: [
                {
                    url: '#pagination',
                    title: 'Pagination',
                    view: PaginationSection,
                    components: ['_partials/Pagination.svelte']
                },
                {
                    url: '#tabs',
                    title: 'Tabs',
                    view: TabsSection,
                    components: ['_partials/Tabs.svelte']
                },
                {
                    url: '#menu',
                    title: 'Menu',
                    view: MenuSection,
                    components: ['_partials/Menu.svelte']
                }
            ]
        },

        {
            title: 'Content',
            pages: [{ url: '#bulma', title: 'Bulma', view: BulmaComponentsSection }]
        },
        {
            title: 'Misc.',
            pages: [
                {
                    url: '#dropdown',
                    title: 'Dropdown',
                    view: DropdownSection,
                    components: ['_partials/Dropdown.svelte']
                },
                {
                    url: '#svelte2',
                    title: 'Svelte2',
                    view: Svelte2Section,
                    components: ['_partials/svelte2/Svelte2Wrapper.svelte']
                },
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
                    {#if activePage.components}
                        <hr />
                        <div class="columns is-multiline">
                            {#each activePage.components as component}
                                <div class="column is-half">
                                    <ComponentInfo {component} info={componentInfos[component]} />
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </section>
</MainLayout>
