/* ═══════════════════════════════════════════════════════════════════
   ks-boot-sync.js — chargement paresseux de Firebase + ks-sync.js.
   ──────────────────────────────────────────────────────────────────
   Le SDK Firebase compat pèse ~151 Ko (app + auth + firestore) et était
   chargé sur 327 pages, y compris pour les visiteurs anonymes qui
   n'ont pas de compte : trafic SEO, blog, leçons consultées sans
   s'inscrire. Or ks-sync.js ne sert qu'à synchroniser la progression
   d'un compte existant.

   Règle : on ne charge le SDK que si un compte existe sur cet appareil
   (clé localStorage 'ks_user'). Sinon on installe le même stub que
   ks-sync.js pose déjà quand le SDK est absent, et on ne télécharge
   rien du tout.

   Les pages qui ont besoin de Firebase SANS compte local (login,
   signup, profil, réglages, classement, avis) gardent leurs balises
   <script> statiques et ne chargent pas ce fichier.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__ksSyncBooted) return;
  window.__ksSyncBooted = true;

  var V = '10.14.1';
  var SDK = [
    'https://www.gstatic.com/firebasejs/' + V + '/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/' + V + '/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/' + V + '/firebase-firestore-compat.js'
  ];

  function hasAccount() {
    try { return !!localStorage.getItem('ks_user'); } catch (e) { return false; }
  }

  /* Pas de compte sur cet appareil → rien à synchroniser, rien à charger. */
  if (!hasAccount()) {
    if (!window.KSSync) window.KSSync = { isAuthed: function () { return false; } };
    return;
  }

  /* async=false conserve l'ordre d'exécution : app → auth → firestore → ks-sync. */
  function load(src, next) {
    var s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = s.onerror = function () { if (next) next(); };
    document.head.appendChild(s);
  }

  var i = 0;
  (function step() {
    if (i < SDK.length) { load(SDK[i++], step); return; }
    load('ks-sync.js', null);
  })();
})();
