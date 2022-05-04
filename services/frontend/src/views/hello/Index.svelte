<script type="text/javascript">
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

    export let magicNumber;
    export let __;

    export let icons;
    let contentRef;

    const menuGroups = [
        {
            title: 'Introduction',
            pages: [
                { url: '#welcome', title: 'Welcome' },
                { url: '#icons', title: 'Icons' }
            ]
        },
        {
            title: 'Navigation',
            pages: [
                { url: '#pagination', title: 'Pagination' },
                { url: '#tabs', title: 'Tabs' },
                { url: '#menu', title: 'Menu' }
            ]
        },
        {
            title: 'Displays',
            pages: [
                { url: '#message', title: 'Message' },
                { url: '#modal', title: 'Modal' },
                { url: '#save', title: 'Save button' }
            ]
        },
        {
            title: 'Controls',
            pages: [
                { url: '#button-groups', title: 'Button groups' },
                { url: '#checkbox', title: 'Checkbox' },
                { url: '#radio', title: 'Radio Input' },
                { url: '#setpassword', title: 'Set Password' },
                { url: '#search', title: 'Search Input' },
                { url: '#tagsinput', title: 'Tags Input' },
                { url: '#typeahead', title: 'Typeahead Input' },
                { url: '#file', title: 'File Input' },
                { url: '#codemirror', title: 'CodeMirror Input' },
                { url: '#switch', title: 'Switch Input' }
            ]
        },
        {
            title: 'Content',
            pages: [
                { url: '#form-field', title: 'Form Field' },
                { url: '#markdown-input', title: 'Markdown Input' },
                { url: '#signup', title: 'Sign Up' },
                { url: '#bulma', title: 'Bulma' }
            ]
        },
        {
            title: 'Misc.',
            pages: [
                { url: '#dropdown', title: 'Dropdown' },
                { url: '#svelte2', title: 'Svelte2' },
                { url: '#errors', title: 'Errors' }
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
                <div class="column" bind:this={contentRef}>
                    <WelcomeSection {magicNumber} {__} />
                    <IconsSection {icons} />

                    <h2 class="title is-2 mt-4 has-text-grey">Navigation</h2>
                    <hr />
                    <PaginationSection />
                    <TabsSection />

                    <MenuSection />
                    <MessageSection />
                    <ModalSection />
                    <SaveButtonSection />

                    <h2 class="title is-2 mt-4 has-text-grey">Controls</h2>
                    <hr />

                    <ButtonGroupSection />
                    <CheckboxSection />
                    <RadioInputSection />
                    <SetPasswordSection {__} />
                    <SearchInputSection />
                    <TagsInputSection />
                    <TypeaheadInputSection />
                    <FileInputSection {__} />
                    <CodeMirrorInputSection />
                    <SwitchControlSection />

                    <h2 class="title is-2 mt-4 has-text-grey">Content</h2>
                    <hr />

                    <FormFieldSection {__} />
                    <MarkdownInputSection {__} />
                    <SignUpSection {__} />
                    <BulmaComponentsSection />

                    <DropdownSection />
                    <Svelte2Section />
                    <ErrorsSection />
                </div>
            </div>
        </div>
    </section>
</MainLayout>
