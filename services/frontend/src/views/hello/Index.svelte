<script type="text/javascript">
    import MainLayout from '_layout/MainLayout.svelte';
    import Menu from '_partials/Menu.svelte';

    import WelcomeSection from './WelcomeSection.svelte';
    import IconsSection from './IconsSection.svelte';
    import ButtonsSection from './ButtonsSection.svelte';
    import BreadcrumbsSection from './BreadcrumbsSection.svelte';
    import PaginationSection from './PaginationSection.svelte';
    import TabsSection from './TabsSection.svelte';
    import MenuSection from './MenuSection.svelte';
    import NotificationSection from './NotificationSection.svelte';
    import MessageSection from './MessageSection.svelte';
    import ModalSection from './ModalSection.svelte';

    import CheckboxSection from './CheckboxSection.svelte';
    import MarkdownInputSection from './MarkdownInputSection.svelte';
    import SetPasswordSection from './SetPasswordSection.svelte';
    import ProgressBarSection from './ProgressBarSection.svelte';
    import TitlesSection from './TitlesSection.svelte';
    import ContentSection from './ContentSection.svelte';
    import TableSection from './TableSection.svelte';
    import FormFieldSection from './FormFieldSection.svelte';
    import FormsSection from './FormsSection.svelte';
    import SignUpSection from './SignUpSection.svelte';
    import DropdownSection from './DropdownSection.svelte';
    import Svelte2Section from './Svelte2Section.svelte';
    import ErrorsSection from './ErrorsSection.svelte';
    import SearchInputSection from './SearchInputSection.svelte';
    import TagsInputSection from './TagsInputSection.svelte';

    export let visualizations;
    export let magicNumber;
    export let __;

    export let icons;
    let contentRef;

    const menuGroups = [
        {
            title: 'Introduction',
            pages: [
                { url: '#welcome', title: 'Welcome' },
                { url: '#icons', title: 'Icons' },
                { url: '#buttons', title: 'Buttons' }
            ]
        },
        {
            title: 'Navigation',
            pages: [
                { url: '#breadcrumbs', title: 'Breadcrumbs' },
                { url: '#pagination', title: 'Pagination' },
                { url: '#tabs', title: 'Tabs' },
                { url: '#menu', title: 'Menu' }
            ]
        },
        {
            title: 'Displays',
            pages: [
                { url: '#notifications', title: 'Notifications' },
                { url: '#message', title: 'Message' },
                { url: '#modal', title: 'Modal' },
                { url: '#progress', title: 'Progress' }
            ]
        },
        {
            title: 'Controls',
            pages: [
                { url: '#checkbox', title: 'Checkbox' },
                { url: '#setpassword', title: 'Set Password' },
                { url: '#search', title: 'Search Input' },
                { url: '#tagsinput', title: 'Tags Input' }
            ]
        },
        {
            title: 'Content',
            pages: [
                { url: '#titles', title: 'Titles' },
                { url: '#content', title: 'Content' },
                { url: '#table', title: 'Table' },
                { url: '#forms', title: 'Forms' },
                { url: '#form-field', title: 'Form Field' },
                { url: '#markdown-input', title: 'Markdown Input' },
                { url: '#signup', title: 'Sign Up' }
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
                    <ButtonsSection />
                    <BreadcrumbsSection />
                    <PaginationSection />
                    <TabsSection />
                    <MenuSection />
                    <NotificationSection />
                    <MessageSection />
                    <ModalSection />
                    <ProgressBarSection />
                    <CheckboxSection />
                    <SetPasswordSection {__} />
                    <SearchInputSection />
                    <TagsInputSection />
                    <TitlesSection />
                    <ContentSection />
                    <TableSection {visualizations} />
                    <FormsSection />
                    <FormFieldSection {__} />
                    <MarkdownInputSection {__} />
                    <SignUpSection {__} />
                    <DropdownSection />
                    <Svelte2Section />
                    <ErrorsSection />
                </div>
            </div>
        </div>
    </section>
</MainLayout>
