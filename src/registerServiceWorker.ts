import { browser } from "$app/environment";
import { installStore } from "./store";

function supportServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.error('No Service Worker support!');
        return false;
    }
    if (!('PushManager' in window)) {
        console.error('No Push API Support!');
        return false;
    }
    return true;
}

if (browser && supportServiceWorker()) {
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        installStore.set(e);
    })
}
