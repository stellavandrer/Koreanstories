// Korean Stories — Service Worker v1.2
// Cache-first pour les pages HTML, network-first pour les images

const CACHE = 'ks-v1.2';

const CORE = [
  'app.html',
  'index.html',
  'lecon.html','lecon2.html','lecon3.html','lecon4.html','lecon5.html',
  'lecon6.html','lecon7.html','lecon8.html','lecon9.html','lecon10.html',
  'histoire1.html','histoire2.html','histoire3.html','histoire4.html',
  'histoires.html','vocabulaire.html','exercice.html',
  'revision.html','hangeul.html','profil.html',
  'manifest.json'
];

// ── Install : précharge les pages core ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.allSettled(CORE.map(url => c.add(url).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

// ── Activate : purge anciens caches ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch : stratégie hybride ──
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Stratégie : réseau d'abord pour les fonts et API externes
  const isExternal = !url.origin.includes(self.location.origin) ||
                     url.hostname.includes('fonts.google') ||
                     url.hostname.includes('translate.google');
  if (isExternal) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 408 })));
    return;
  }

  // Stratégie cache-first pour HTML/JS/CSS
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);

      // HTML → network-first (contenu récent) avec fallback cache
      const isHTML = e.request.headers.get('accept')?.includes('text/html');
      if (isHTML) return networkFetch.catch(() => cached);

      // Images + assets → cache-first
      return cached || networkFetch;
    })
  );
});

// ── Message : force refresh du cache ──
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
