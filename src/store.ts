import { browser } from '$app/environment';
import { writable, readable, get, derived, type Readable, type Writable } from 'svelte/store';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed',
        platform: string
    }>;
    prompt(): Promise<void>;
}

function createInstallStore() {
    const installStore = writable<BeforeInstallPromptEvent | null>(null)
    async function install() {
        get(installStore)?.prompt();
        if ((await get(installStore)?.userChoice)?.outcome !== 'dismissed') {
            installStore.set(null)
        }
    }
    return {
        ...installStore,
        install
    }
}
export const installStore = createInstallStore()
export const screenSize = readable<number>(1000, (set) => {
    function handleResize() {
        set(Math.min(window.innerWidth, window.innerHeight))
    }
    if (browser) {
        set(Math.min(window.innerWidth, window.innerHeight))
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }
})
export const titleScreen = writable(true)
export const win = writable(false)

let idleTimeout: number;
export const idle: Readable<boolean> = derived(titleScreen, ($lost, set) => {
    clearTimeout(idleTimeout);
    if ($lost) {
        idleTimeout = setTimeout(() => {
            set(true)
        }, 3000);
    } else {
        set(false)
    }
}, true)
