const CACHE_NAME = 'PDF-viewer-V1';

const CacheHelper = {
    async cachingAppShell(requests) {
        const cache = await this._openCache();
        await cache.addAll(requests);
    },

    async deleteOldCache() {
        const cacheNames = await caches.keys();
        cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((filteredName) => caches.delete(filteredName));
    },

    async revalidateCache(request) {
        const response = await caches.match(request);

        if (response) {
            this._fetchRequest(request);
            return response;
        }

        return this._fetchRequest(request);
    },

    async _openCache() {
        return caches.open(CACHE_NAME);
    },

    async _fetchRequest(request) {
        const response = await fetch(request);

        if (!response || response.status !== 200) {
            return response;
        }

        await this._addCache(request);
        return response;
    },

    async _addCache(request) {
        const cache = await this._openCache();
        await cache.add(request);
    },
};

const {
    assets,
} = global.serviceWorkerOption;

self.addEventListener('install', (event) => {
    event.waitUntil(CacheHelper.cachingAppShell([...assets, './']));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(CacheHelper.deleteOldCache());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method === 'POST') {
        event.respondWith(fetch(event.request));
    } else {
        event.respondWith(CacheHelper.revalidateCache(event.request.url));
    }
});