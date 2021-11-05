import { writable } from 'svelte/store';

const currentFolder = new writable({});

export { currentFolder };
