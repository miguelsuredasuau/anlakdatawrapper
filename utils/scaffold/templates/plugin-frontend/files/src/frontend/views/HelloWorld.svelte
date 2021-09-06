<script type="text/javascript">
    import MainLayout from 'layout/MainLayout.svelte';
    // import { onMount, getContext } from 'svelte';

    // __ is for translations
    export let __;
</script>

<MainLayout title="Hello world">
    <div class="container">
    	<h1>{__('Hello World', 'my-new-plugin')}</h1>
    </div>
</MainLayout>