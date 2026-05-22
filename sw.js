// Korean Stories — Service Worker v2.1
// Network-first pour HTML/JS/CSS (toujours à jour),
// cache-first pour les images & polices (rarement modifiées).

const CACHE = 'ks-v2.1';

const CORE = [
  // App shell
  'app.html',
  'index.html',
  'cours.html',
  'profil.html',
  'histoires.html',
  'exercice.html',
  'vocabulaire.html',
  'hangeul.html',
  'revision.html',
  'ressources.html',
  'login.html',
  'signup.html',
  'test-niveau.html',
  'manifest.json',

  // Leçons Hangeul (Débutant)
  'lecon.html','lecon2.html','lecon3.html','lecon4.html','lecon5.html',
  'lecon6.html','lecon7.html','lecon8.html','lecon9.html','lecon10.html',

  // Leçons A1
  'lecon_a1.html',

  // Contenu premium A1
  'prem-audio-a1.html',
  'prem-ecrit-a1.html',
  'prem-oral-a1.html',
  'prem-quiz-a1.html',

  // Histoires
  'histoire1.html','histoire2.html','histoire3.html','histoire4.html',
  'histoire5.html','histoire6.html','histoire7.html','histoire8.html',
  'histoire9.html','histoire10.html','histoire11.html',
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

  // Réseau d'abord pour fonts & API externes
  const isExternal = url.origin !== self.location.origin ||
                     url.hostname.includes('fonts.google') ||
                     url.hostname.includes('translate.google') ||
                     url.hostname.includes('googleapis.com') ||
                     url.hostname.includes('gstatic.com');
  if (isExternal) {
    e.respondWith(
      caches.match(e.request).then(cached =>
        fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        }).catch(() => cached || new Response('', { status: 408 }))
      )
    );
    return;
  }

  // HTML, JS et CSS → network-first (toujours à jour) avec fallback cache.
  // Indispensable : sans ça, les modules JS (ks.js, ks-srs.js…) restent
  // figés sur une vieille version chez les utilisateurs ayant la PWA.
  const isHTML = e.request.headers.get('accept')?.includes('text/html');
  const isCode = /\.(?:js|css)(?:\?|$)/i.test(url.pathname);
  if (isHTML || isCode) {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Images + polices + autres assets statiques → cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      });
    })
  );
});

// ── Message : force refresh du cache ──
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
