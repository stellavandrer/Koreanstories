/* ── Site Access Gate ─────────────────────────────────────────────
   ACCÈS LIBRE — mot de passe supprimé le 2026-05-28.
   Le script reste référencé par 200+ fichiers HTML donc on le garde
   en place mais sans aucune protection. Il sert maintenant uniquement
   à forcer le HTTPS sur les visiteurs arrivés en HTTP.
─────────────────────────────────────────────────────────────────── */
(function () {
  /* Force HTTPS — évite l'avertissement "connexion non sécurisée" si
     l'utilisateur arrive via http://koreanstories.fr (au cas où
     "Enforce HTTPS" n'est pas activé côté GitHub Pages). */
  try {
    if (location.protocol === 'http:' &&
        location.hostname !== 'localhost' &&
        location.hostname !== '127.0.0.1' &&
        location.hostname.indexOf('192.168.') !== 0) {
      location.replace('https:' + window.location.href.substring(window.location.protocol.length));
      return;
    }
  } catch (e) {}

  /* Marqueur session pour les anciennes pages qui testent ks_access */
  try { sessionStorage.setItem('ks_access', 'ok'); } catch (e) {}
})();
