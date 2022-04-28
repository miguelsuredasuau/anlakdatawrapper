import { writable } from 'svelte/store';

const headerProps = new writable({
    isSticky: false,
    height: 0
});

const openedInsideIframe = new writable(false);

export { headerProps, openedInsideIframe };
