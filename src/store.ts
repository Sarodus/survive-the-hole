import { writable } from 'svelte/store';

export const minWidth = writable(1080);
export const lost = writable(true)
export const installStore = writable<Event | null>(null)
