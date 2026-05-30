// Korean Stories — Service Worker v2.5
// Network-first pour HTML/JS/CSS (toujours à jour),
// cache-first pour les images & polices (rarement modifiées).
// Bypass pour les APIs externes type DiceBear (l'interception
// no-cors pose problème dans certains navigateurs).
// v2.3 : ajout notificationclick handler.
// v2.4 : bypass Unsplash pour bannières de leçons.
// v2.5 : ajout pages fin de parcours (certificat, apres-b2),
//        modules JS récents (ks-curriculum, ks-install-prompt),
//        histoires 12-30 (curriculum complet).

const CACHE = 'ks-v2.5';

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

  // Fin de parcours (v2.5)
  'certificat.html',
  'apres-b2.html',

  // Modules JS partagés
  'ks.js',
  'ks-curriculum.js',
  'ks-sync.js',
  'ks-search.js',
  'ks-install-prompt.js',
  'gate.js',
  'design.css',

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

  // Histoires (toutes — curriculum complet, v2.5)
  'histoire1.html','histoire2.html','histoire3.html','histoire4.html',
  'histoire5.html','histoire6.html','histoire7.html','histoire8.html',
  'histoire9.html','histoire10.html','histoire11.html','histoire12.html',
  'histoire13.html','histoire14.html','histoire15.html','histoire16.html',
  'histoire17.html','histoire18.html','histoire19.html','histoire20.html',
  'histoire21.html','histoire22.html','histoire23.html','histoire24.html',
  'histoire25.html','histoire26.html','histoire27.html','histoire28.html',
  'histoire29.html','histoire30.html',
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

  // DiceBear (avatars) + Unsplash (bannières leçons) → bypass total,
  // on laisse le navigateur gérer directement. L'interception SW pose
  // problème avec les requêtes no-cors d'images depuis ces CDN.
  if (url.hostname.includes('dicebear.com') ||
      url.hostname.includes('images.unsplash.com') ||
      url.hostname.includes('source.unsplash.com')) {
    return;
  }

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

// ── Notification click : ouvre l'app si déjà ouverte, sinon nouvelle fenêtre ──
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const targetUrl = (e.notification.data && e.notification.data.url) || '/app.html';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
      for (const c of clientsArr) {
        if (c.url.includes('app.html') && 'focus' in c) return c.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
