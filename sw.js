// Korean Stories — Service Worker v2.7
// Network-first pour HTML/JS/CSS (toujours à jour),
// cache-first pour les images & polices (rarement modifiées).
// Bypass pour les APIs externes type DiceBear (l'interception
// no-cors pose problème dans certains navigateurs).
// v2.3 : ajout notificationclick handler.
// v2.4 : bypass Unsplash pour bannières de leçons.
// v2.5 : ajout pages fin de parcours (certificat, apres-b2),
//        modules JS récents (ks-curriculum, ks-install-prompt),
//        histoires 12-30 (curriculum complet).
// v2.6 : ajout pages publiques (a-propos, aide, mentions-legales)
//        et modules onboarding tour.
// v3.0 : site 100% sans émoji (icônes SVG partout), barre de menu
//        accessibilisée (indicateur d'onglet actif non-coloré, focus
//        visible, libellés gardés pour lecteurs d'écran), filtre du
//        blog accessible (aria-pressed + annonce du nombre d'articles).
// v2.9 : accueil + dashboard à jour (nouveautés mises en avant),
//        bannière maj non bloquante, Quoi de neuf rafraîchi.
// v2.8 : studio des voix, blog illustré, fix écran révision vide.
// v2.7 : mode hors-ligne complet (téléchargement du parcours +
//        audio avec progression via message KS_CACHE_URLS),
//        page de repli offline.html, rappel quotidien du Mix
//        via Periodic Background Sync, nouvelles pages (daily-mix,
//        ecriture/clavier, trophées badges, histoires 31-42,
//        leçons 61-63).

// v3.1 : refonte des histoires (chat animé + scène illustrée + lecture
//        auto de la conversation, via ks-stories.js).
// v3.2 : marque-page / reprise de lecture — barre de progression + bouton
//        « Reprendre » par histoire (ks-stories.js), et progression +
//        « Reprendre la lecture » sur les cartes du hub histoires.html
//        (cartes désormais cliquables comme de vrais liens).
// v3.3 : illustrations IA des histoires (img/stories/histoireN.webp) —
//        en-tête illustré sur chaque page histoire (chat + lecture) via
//        ks-stories.js (repli scène SVG si image absente) + couverture sur
//        les cartes du hub. Les WebP se mettent en cache à la visite
//        (stratégie cache-first des images).
// v3.5 : purge forcée — d'anciens caches servaient encore une version
//        cassée des planches BD (histoireN-bd.html) où le script JS était
//        invalide, donc audio muet. Ce bump vide tout l'ancien cache.
// v3.6 : fusion des hubs — histoires.html regroupe désormais Histoires
//        (chat), Lectures et Planches BD via 3 onglets. lecture.html
//        devient une simple redirection. Bump pour purger l'ancienne
//        version en cache chez les utilisateurs PWA.
// v3.7 : planches BD — romanisation retirée, narration en coréen (FR en
//        option), bulles adaptées au mobile, « déjà lu » (ks-bd.js).
//        Parcours pointant vers les planches BD. Articles de presse + B2.
// v3.8 : refonte complète de la page d'accueil (index.html) — hero, vitrine
//        des histoires, parcours, tarifs freemium, à propos, FAQ. Tour
//        d'onboarding désormais réservé à app.html (plus sur la landing).
// v3.9 : nouveau dictionnaire intelligent (dictionnaire.html) — recherche
//        FR⇄KR, audio, romanisation + conjugaison auto des verbes/adjectifs.
const CACHE = 'ks-v7.30';
const STATE_CACHE = 'ks-state'; // état partagé page ↔ SW (mix fait, notifs)

const CORE = [
  // App shell
  'app.html',
  'index.html',
  'cours.html',
  'profil.html',
  'histoires.html',
  'dictionnaire.html',
  'ks-dictionary.js',
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

  // Pages publiques (v2.6)
  'a-propos.html',
  'aide.html',
  'mentions-legales.html',
  'cgv.html',
  'confidentialite.html',

  // Modules JS partagés
  'ks.js',
  'ks-stories.js',
  'ks-bd.js',
  'ks-menu.js',
  'ks-curriculum.js',
  'ks-sync.js',
  'ks-search.js',
  'ks-premium.js',
  'premium.html',
  'premium-success.html',
  'blog-apprendre-coreen-kdrama.html',
  'ks-install-prompt.js',
  'ks-sw-update.js',
  'ks-onboarding.js',
  'gate.js',
  'design.css',
  'fonts/ks-fonts.css',
  'ks-cookie-consent.js',

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

  // v2.7 — nouvelles pages & modules
  'offline.html',
  'daily-mix.html',
  'ecriture.html',
  'trophees.html',
  'ks-keyboard.js',
  'ks-offline-manifest.js',
  'histoire31.html','histoire32.html','histoire33.html','histoire34.html',
  'histoire35.html','histoire36.html','histoire37.html','histoire38.html',
  'histoire39.html','histoire40.html','histoire41.html','histoire42.html',
  'lecon61.html','lecon62.html','lecon63.html',
  'lecon64.html','lecon65.html','lecon66.html','lecon67.html',
  'exercice25.html','exercice26.html','exercice27.html','exercice28.html',
  'jeu13.html','jeu14.html','jeu15.html','jeu16.html','jeu17.html',
  'pdf/restaurant-a1.html','pdf/decrire-a1.html','pdf/transports-a2.html','pdf/loisirs-a2.html',
  'conseil9.html','anecdote20.html',
  'voix.html',
  'blog.html','blog-premier-voyage-coree.html','blog-cuisine-coreenne-debutants.html',
  'blog-etiquette-coreenne.html','blog-combien-temps-apprendre-coreen.html',

  // Podcasts (transcription + lecture vocale + XP)
  'ks-podcast.js','ks-podcast.css',
  'podcast1.html','podcast2.html','podcast3.html','podcast4.html','podcast5.html',

  // Lectures — articles de presse (modules partagés + nouveaux A1)
  'ks-presse.js','ks-presse.css',
  'presse8.html','presse9.html',
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
  // Le manifest audio grandit à chaque nouvelle voix/histoire : il DOIT rester
  // frais, sinon les nouveaux MP3 n'ont pas de clé et l'audio reste muet.
  const isManifest = /manifest\.json(?:\?|$)/i.test(url.pathname);
  if (isHTML || isCode || isManifest) {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() =>
        caches.match(e.request, { ignoreSearch: isHTML }).then(cached => {
          if (cached) return cached;
          /* Page jamais visitée + hors-ligne → page de repli */
          if (isHTML) return caches.match('offline.html');
          return undefined;
        })
      )
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

// ── Message : force refresh du cache + téléchargement hors-ligne ──
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') { self.skipWaiting(); return; }

  /* Téléchargement massif pour le mode hors-ligne.
     { type:'KS_CACHE_URLS', jobId, urls:[...] }
     Progression renvoyée au client : KS_CACHE_PROGRESS / KS_CACHE_DONE.
     Par lots de 12 requêtes parallèles — assez rapide sans saturer. */
  const data = e.data || {};
  if (data.type === 'KS_CACHE_URLS' && Array.isArray(data.urls)) {
    const client = e.source;
    const jobId = data.jobId || 'job';
    e.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const urls = data.urls;
      let done = 0, failed = 0;
      const BATCH = 12;
      for (let i = 0; i < urls.length; i += BATCH) {
        const slice = urls.slice(i, i + BATCH);
        await Promise.all(slice.map(async u => {
          try {
            /* Skip si déjà en cache (reprise après interruption) */
            const hit = await cache.match(u);
            if (hit) { done++; return; }
            const res = await fetch(u, { cache: 'no-cache' });
            if (res.ok) { await cache.put(u, res); done++; }
            else failed++;
          } catch (err) { failed++; }
        }));
        if (client) client.postMessage({ type: 'KS_CACHE_PROGRESS', jobId, done, failed, total: urls.length });
      }
      if (client) client.postMessage({ type: 'KS_CACHE_DONE', jobId, done, failed, total: urls.length });
    })());
  }

  /* État partagé page → SW (mix fait aujourd'hui, préférences notifs).
     Stocké dans un cache dédié car le SW n'a pas accès au localStorage. */
  if (data.type === 'KS_STATE') {
    e.waitUntil(
      caches.open(STATE_CACHE).then(c =>
        c.put('/__ks-state', new Response(JSON.stringify(data.state || {}), {
          headers: { 'Content-Type': 'application/json' }
        }))
      )
    );
  }
});

// ── Periodic Background Sync : rappel quotidien du Mix ──
// Chrome/Edge avec PWA installée. Le navigateur déclenche l'événement
// ~1×/jour ; on notifie seulement si le mix n'est pas fait et qu'on
// n'a pas déjà rappelé aujourd'hui.
self.addEventListener('periodicsync', e => {
  if (e.tag !== 'ks-daily-mix') return;
  e.waitUntil((async () => {
    try {
      const c = await caches.open(STATE_CACHE);
      const res = await c.match('/__ks-state');
      const st = res ? await res.json() : {};
      if (st.notifEnabled === false) return;
      const today = new Date().toISOString().slice(0, 10);
      if (st.mixDone === today) return;          // mix déjà fait
      if (st.swNotifLast === today) return;      // déjà rappelé
      st.swNotifLast = today;
      await c.put('/__ks-state', new Response(JSON.stringify(st), {
        headers: { 'Content-Type': 'application/json' }
      }));
      await self.registration.showNotification('Ton mix du jour t\'attend', {
        body: '10 questions sur tout ce que tu as appris — 3 minutes, +15 XP.',
        icon: 'Logo/Logo - KoreanStories_logo_4x4_bleu.png',
        badge: 'Logo/Logo - KoreanStories_logo_4x4_bleu.png',
        tag: 'ks-daily-mix',
        data: { url: '/daily-mix.html' }
      });
    } catch (err) {}
  })());
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
