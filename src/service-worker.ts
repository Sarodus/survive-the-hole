import { build, files, version } from '$service-worker';

// has to be var, because we need function scope
declare var self: ServiceWorkerGlobalScope;

/**
 * Takes care of the installation of the service worker, as well as the creation of the cache.
 */
self.addEventListener('install', (event: ExtendableEvent): void => {
    console.log('installing service worker');
    self.skipWaiting();
    event.waitUntil(
        caches.open(version).then((cache) => {
            // Open a cache and cache our files
            const allFiles = build.concat(files)
            cache.addAll(allFiles);
            return true;
        }),
    );
});

/**
 * Intercepts requests made by the page so we can decide what to do with each one.
 */
self.addEventListener('fetch', (event: FetchEvent): void => {
    event.respondWith(
        caches.match(event.request).then((cacheResponse) => {

            if (cacheResponse) {
                console.info(`fetching from cache: ${event.request.url}`);

                return cacheResponse;
            }

            console.info(`trying to fetch from server: ${event.request.url}`);

            return fetch(event.request)
                .then(async (fetchResponse): Promise<Response | undefined> => {
                    if (
                        event.request.url.indexOf('http') !== -1
                    ) {
                        const cache = await caches.open(version);

                        try {
                            // filter what to add to the cache
                            if (
                                fetchResponse.status !== 206
                            ) {
                                cache.put(event.request.url, fetchResponse.clone());
                            }

                        } catch (error) {
                            console.error(error);
                        }

                        return fetchResponse;
                    }

                    // eslint-disable-next-line consistent-return
                    return undefined;
                })
                .catch(((error) => {
                    console.error(`"${error}: ${event.request.url}`);

                    return error;
                }));
        }),
    );
});

/**
 * Intercepts whe the service worker is activated.
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (!build.includes(key)) {
                    return caches.delete(key);
                }
            })
        ))
    );
});
