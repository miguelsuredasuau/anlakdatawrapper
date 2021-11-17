import { writable } from 'svelte/store';

const headerProps = new writable({
    isSticky: false,
    height: 0
});

export { headerProps };
