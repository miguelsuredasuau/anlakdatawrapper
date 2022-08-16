<script type="text/javascript">
    import { onMount } from 'svelte';
    import { readable } from 'svelte/store';
    import MainLayout from '_layout/MainLayout.svelte';
    import TreeMenu from './TreeMenu.svelte';
    import ComponentInfo from './ComponentInfo.svelte';

    import RadioInput from '_partials/controls/RadioInput.svelte';

    import * as sections from './sections';

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
                    view: sections.WelcomeSection,
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
                    view: sections.IconsSection,
                    props: { icons, __ },
                    components: ['_partials/displays/IconDisplay.svelte']
                },
                {
                    url: '#message',
                    title: 'Message',
                    view: sections.MessageSection,
                    components: ['_partials/displays/MessageDisplay.svelte']
                },
                {
                    url: '#modal',
                    title: 'Modal',
                    view: sections.ModalSection,
                    components: ['_partials/displays/ModalDisplay.svelte']
                },
                {
                    url: '#save',
                    title: 'Save button',
                    view: sections.SaveButtonSection,
                    components: ['_partials/displays/SaveButtonDisplay.svelte']
                },
                {
                    url: '#form-field',
                    title: 'FormField',
                    view: sections.FormFieldSection,
                    components: ['_partials/displays/FormFieldDisplay.svelte'],
                    props: { __ }
                },
                {
                    url: '#form-field-h',
                    title: 'FormField (horiz.)',
                    view: sections.HorizontalFormFieldSection,
                    components: ['_partials/displays/HorizontalFormFieldDisplay.svelte'],
                    props: { __ }
                },
                {
                    url: '#preview',
                    title: 'ChartIframePreview',
                    view: sections.ChartPreviewIframeSection,
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
                    view: sections.ButtonGroupSection,
                    components: ['_partials/controls/ButtonGroupInput.svelte']
                },
                {
                    url: '#checkbox',
                    title: 'Checkbox',
                    view: sections.CheckboxSection,
                    components: ['_partials/controls/CheckboxInput.svelte']
                },
                {
                    url: '#radio',
                    title: 'Radio Input',
                    view: sections.RadioInputSection,
                    components: ['_partials/controls/RadioInput.svelte']
                },
                {
                    url: '#switch',
                    title: 'Switch Input',
                    view: sections.SwitchControlSection,
                    components: ['_partials/controls/SwitchControl.svelte']
                },
                {
                    url: '#textinput',
                    title: 'Text Input',
                    view: sections.TextInputSection,
                    components: [
                        '_partials/controls/TextInput.svelte',
                        '_partials/controls/TextAreaInput.svelte'
                    ]
                },
                {
                    url: '#numberinput',
                    title: 'Number Input',
                    view: sections.NumberInputSection,
                    components: ['_partials/controls/NumberInput.svelte']
                },
                {
                    url: '#tagsinput',
                    title: 'Tags Input',
                    view: sections.TagsInputSection,
                    components: ['_partials/controls/TagsInput.svelte']
                },
                {
                    url: '#typeahead',
                    title: 'Typeahead Input',
                    view: sections.TypeaheadInputSection,
                    components: ['_partials/controls/TypeaheadInput.svelte']
                },
                {
                    url: '#search',
                    title: 'Search Input',
                    view: sections.SearchInputSection,
                    components: ['_partials/controls/SearchInput.svelte']
                },
                {
                    url: '#setpassword',
                    title: 'Set Password',
                    view: sections.SetPasswordSection,
                    components: ['_partials/controls/SetPasswordInput.svelte'],
                    props: { __ }
                },
                {
                    url: '#markdown-input',
                    title: 'Markdown Input',
                    view: sections.MarkdownInputSection,
                    components: ['_partials/controls/MarkdownInput.svelte'],
                    props: { __ }
                },
                {
                    url: '#file',
                    title: 'File Input',
                    view: sections.FileInputSection,
                    props: { __ },
                    components: ['_partials/controls/MarkdownInput.svelte']
                },
                {
                    url: '#codemirror',
                    title: 'CodeMirror Input',
                    view: sections.CodeMirrorInputSection,
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
                    view: sections.ToolbarSection,
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
                    view: sections.PaginationSection,
                    components: ['_partials/Pagination.svelte']
                },
                {
                    url: '#tabs',
                    title: 'Tabs',
                    view: sections.TabsSection,
                    components: ['_partials/Tabs.svelte']
                },
                {
                    url: '#menu',
                    title: 'Menu',
                    view: sections.MenuSection,
                    components: ['_partials/Menu.svelte']
                }
            ]
        },

        {
            title: 'Content',
            pages: [{ url: '#bulma', title: 'Bulma', view: sections.BulmaComponentsSection }]
        },
        {
            title: 'Misc.',
            pages: [
                {
                    url: '#dropdown',
                    title: 'Dropdown',
                    view: sections.DropdownSection,
                    components: ['_partials/Dropdown.svelte']
                },
                {
                    url: '#svelte2',
                    title: 'Svelte2',
                    view: sections.Svelte2Section,
                    components: ['_partials/svelte2/Svelte2Wrapper.svelte']
                },
                { url: '#errors', title: 'Errors', view: sections.ErrorsSection }
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
                        <div class="columns is-widescreen is-multiline">
                            {#each activePage.components as component}
                                <div class="column">
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
