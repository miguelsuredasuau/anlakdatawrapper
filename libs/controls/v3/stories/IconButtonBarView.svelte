<script>
    import IconButtonBar from '../IconButtonBar.svelte';
    import IconButton from '../IconButton.svelte';
    import IconFileButton from '../IconFileButton.svelte';

    const buttons = [
        {
            id: 'csv',
            icon: 'fa fa-clipboard',
            title: 'Copy & paste data table'
        },
        {
            id: 'xls',
            icon: 'fa fa-file-excel-o',
            title: 'XLS/CSV upload',
            type: IconFileButton
        },
        {
            id: 'link',
            icon: 'im im-link',
            title: 'Link external dataset',
            handler() {
                alert('some custom action');
            }
        }
    ];

    function activate(button) {
        active = button.id;
        if (button.handler) {
            button.handler();
        }
    }

    export let active = 'csv';
</script>

<IconButtonBar>
    {#each buttons as btn}
        <li style="width: {100 / buttons.length}%; box-sizing: border-box">
            <svelte:component
                this={btn.type || IconButton}
                on:click={() => activate(btn)}
                icon={btn.icon}
                title={btn.title}
                active={active === btn.id}
            />
        </li>
    {/each}
</IconButtonBar>
