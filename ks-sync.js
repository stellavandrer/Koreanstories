/* ═══════════════════════════════════════════════════════════════════
   ks-sync.js — Synchronisation multi-appareils via Firebase
   - Authentification : Firebase Auth (email/mot de passe).
   - Stockage : Firestore /users/{uid} → { data: { ks_* : "..." } }.
   - Stratégie : à la connexion, on adopte la version cloud ; ensuite
     on pousse les changements localStorage toutes les ~12 s + au quit.
   - Les invités restent en local — aucun appel réseau pour eux.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (typeof firebase === 'undefined' || !firebase.initializeApp) {
    /* SDK non chargé — ks-sync se désactive silencieusement. */
    window.KSSync = { isAuthed: function () { return false; } };
    return;
  }

  var CONFIG = {
    apiKey: "AIzaSyDvFbaoXmB23ayTNRk1-npQ9-s8inwCJao",
    authDomain: "korean-stories-68377.firebaseapp.com",
    projectId: "korean-stories-68377",
    storageBucket: "korean-stories-68377.firebasestorage.app",
    messagingSenderId: "906164649426",
    appId: "1:906164649426:web:f500330acffff803badc0b"
  };

  try { firebase.initializeApp(CONFIG); } catch (e) { /* déjà initialisé */ }
  var auth = firebase.auth();
  var db   = firebase.firestore();

  /* ── Quelles clés on synchronise ─────────────────────────────────── */
  /* On part de TOUTES les clés ks_* sauf celles propres à l'appareil
     ou propres à l'auth locale (qui n'a plus de sens avec Firebase). */
  var EXCLUDE = {
    'ks_theme': 1,        /* préférence d'appareil */
    'ks_access': 1,       /* session du gate (sessionStorage en fait) */
    'ks_user': 1,         /* dérivé de Firebase Auth */
    'ks_accounts': 1,     /* ancien système email local — obsolète */
    'ks_profile': 1       /* ancien profil local — obsolète */
  };
  function isSyncKey(k) {
    if (!k || k.indexOf('ks_') !== 0) return false;
    if (EXCLUDE[k]) return false;
    return true;
  }

  function snapshot() {
    var m = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (isSyncKey(k)) m[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return m;
  }

  /* ── Push / Pull ─────────────────────────────────────────────────── */
  var LAST_PUSHED = null;
  var SYNCING = false;
  var watcher = null;

  function pushNow(uid) {
    if (!uid || SYNCING) return Promise.resolve(false);
    var snap = snapshot();
    var json = JSON.stringify(snap);
    if (json === LAST_PUSHED) return Promise.resolve(false);
    SYNCING = true;
    return db.collection('users').doc(uid).set({
      data: snap,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
      .then(function () { LAST_PUSHED = json; return true; })
      .catch(function (err) { console.warn('[ks-sync] push:', err && err.message || err); return false; })
      .then(function (ok) { SYNCING = false; return ok; });
  }

  function pullOnce(uid) {
    if (!uid) return Promise.resolve('no-uid');
    return db.collection('users').doc(uid).get().then(function (doc) {
      var data = (doc.exists && doc.data() && doc.data().data) || {};
      var hasRemote = Object.keys(data).length > 0;
      if (hasRemote) {
        /* Garde-fou anti-écrasement : si le local a plus d'XP que le
           cloud, c'est que le cloud est en retard (push pas encore
           passé). On garde le local et on le pousse. */
        var localXp  = parseInt(localStorage.getItem('ks_xp') || '0', 10) || 0;
        var remoteXp = parseInt(data['ks_xp'] || '0', 10) || 0;
        if (localXp > remoteXp) {
          var snap = snapshot();
          return db.collection('users').doc(uid).set({
            data: snap, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true }).then(function () {
            LAST_PUSHED = JSON.stringify(snap);
            return 'kept-local';
          });
        }
        for (var k in data) {
          if (isSyncKey(k) && typeof data[k] === 'string') {
            try { localStorage.setItem(k, data[k]); } catch (e) {}
          }
        }
        LAST_PUSHED = JSON.stringify(snapshot());
        return 'pulled';
      }
      /* Doc vide ou inexistant → on upload le local comme état initial */
      var snap = snapshot();
      if (Object.keys(snap).length === 0) return 'empty';
      return db.collection('users').doc(uid).set({
        data: snap,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).then(function () {
        LAST_PUSHED = JSON.stringify(snap);
        return 'pushed';
      });
    });
  }

  /* ── Push réactif : déclenché 1.5 s après le dernier setItem ─────── */
  var pushDebounce = null;
  function schedulePush() {
    var u = auth.currentUser;
    if (!u) return;
    if (pushDebounce) clearTimeout(pushDebounce);
    pushDebounce = setTimeout(function () { pushNow(u.uid); }, 1500);
  }
  /* Patch léger : on intercepte les écritures de clés ks_* synchronisables
     pour déclencher une push debounce — sans bloquer le code appelant. */
  (function patchSetItem() {
    var orig = localStorage.setItem.bind(localStorage);
    try {
      localStorage.setItem = function (k, v) {
        orig(k, v);
        if (isSyncKey(k)) schedulePush();
      };
    } catch (e) { /* certains environnements interdisent — on ignore */ }
  })();

  /* ── Auth state ─────────────────────────────────────────────────── */
  auth.onAuthStateChanged(function (user) {
    if (watcher) { clearInterval(watcher); watcher = null; }
    LAST_PUSHED = null;

    if (!user) return;

    /* Aligne ks_user avec la session Firebase pour que le reste du site
       (greeting, profil, gate.js) sache qu'on est connecté. */
    try {
      var stored = JSON.parse(localStorage.getItem('ks_user') || 'null') || {};
      stored.uid = user.uid;
      stored.email = user.email;
      stored.guest = false;
      if (!stored.name) stored.name = user.displayName || (user.email || '').split('@')[0];
      localStorage.setItem('ks_user', JSON.stringify(stored));
    } catch (e) {}

    /* Sync initial puis watcher périodique. Sur les pages d'auth, le
       script de login/signup fait déjà son propre pull — on évite le
       double aller-retour. */
    var p = location.pathname;
    var skipInitial = /(login|signup|onboarding|bienvenue)\.html$/i.test(p);
    var initial = skipInitial ? Promise.resolve('skip') : pullOnce(user.uid).catch(function () { return 'err'; });

    initial.then(function () {
      watcher = setInterval(function () { pushNow(user.uid); }, 12000);
    });
  });

  /* Push final à la fermeture / au changement de page */
  window.addEventListener('beforeunload', function () {
    var u = auth.currentUser;
    if (u) {
      /* Best-effort : non-bloquant, peut être interrompu */
      try { pushNow(u.uid); } catch (e) {}
    }
  });

  /* ── API publique ───────────────────────────────────────────────── */
  window.KSSync = {
    push:     function () { var u = auth.currentUser; return u ? pushNow(u.uid) : Promise.resolve(false); },
    pull:     function () { var u = auth.currentUser; return u ? pullOnce(u.uid) : Promise.resolve('not-signed-in'); },
    isAuthed: function () { return !!auth.currentUser; },
    user:     function () { return auth.currentUser; },
    auth:     auth,
    db:       db
  };
})();
