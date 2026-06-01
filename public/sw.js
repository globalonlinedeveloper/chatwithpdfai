// Tombstone service worker.
// The previous static-site SW cached dead paths (/landing.html, /chrome.jsx).
// The current Next.js app registers NO service worker. This version unregisters
// any lingering old SW and clears its caches for returning visitors, then removes
// itself. It is inert for anyone who never registered the old worker.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (e) {}
    try { await self.clients.claim(); } catch (e) {}
    try { await self.registration.unregister(); } catch (e) {}
  })());
});
