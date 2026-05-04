// Injects Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers
// via a Service Worker so SharedArrayBuffer works on GitHub Pages (static hosting).
// Standard pattern used by many GitHub Pages projects.

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.cache === 'only-if-cached' && e.request.mode !== 'same-origin') return;

  e.respondWith(
    fetch(e.request).then(res => {
      if (!res || res.status === 0 || res.type === 'opaque') return res;
      const h = new Headers(res.headers);
      h.set('Cross-Origin-Opener-Policy',   'same-origin');
      h.set('Cross-Origin-Embedder-Policy', 'require-corp');
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
    }).catch(() => fetch(e.request))
  );
});
