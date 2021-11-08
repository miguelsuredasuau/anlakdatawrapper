import { writable } from 'svelte/store';

const currentFolder = new writable({});

const searchQuery = new writable('');

export { currentFolder, searchQuery };
